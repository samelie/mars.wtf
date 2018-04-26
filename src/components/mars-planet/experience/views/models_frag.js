import LambertDiffuse from './lambert_diffuse'
import {spotFrag} from '../rad/SpotLight'

import {
    sunSkyPosition,
    SUN_MORNING,
    SUN_EVENING,
    mixMorningEvening
} from '../terrain/sun'

const F = `

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform sampler2D 	uDiffuse;
uniform sampler2D 	uAoMap;
uniform sampler2D 	shadowMap;
//uniform samplerCube uRadianceMap;
//uniform samplerCube uIrradianceMap;

uniform vec3		uBaseColor;
uniform float		uRoughness;
uniform float		uRoughness4;
uniform float		uMetallic;
uniform float		uSpecular;
uniform float 		uAoStrength;
uniform float		uExposure;
uniform float		uGamma;
uniform float		uGreenOffset;

uniform float baseColorAmount;
uniform float diffuseColorAmount;
uniform float uLightIntensity;

uniform int useDepth;
uniform float uAngle;

varying vec3        vNormal;
varying vec3        vPosition;
varying vec3		vEyePosition;
varying vec3		vWsNormal;
varying vec3		vWsPosition;
varying vec2 		vTextureCoord;

varying vec3 vLightRay;
varying vec3 vEyeVec;

#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.1415926535897932384626433832795


// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

${SUN_MORNING}
${SUN_EVENING}
${sunSkyPosition}
${mixMorningEvening}


vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
}


// http://the-witness.net/news/2012/02/seamless-cube-map-filtering/
vec3 fix_cube_lookup( vec3 v, float cube_size, float lod ) {
	float M = max(max(abs(v.x), abs(v.y)), abs(v.z));
	float scale = 1.0 - exp2(lod) / cube_size;
	if (abs(v.x) != M) v.x *= scale;
	if (abs(v.y) != M) v.y *= scale;
	if (abs(v.z) != M) v.z *= scale;
	return v;
}

vec3 correctGamma(vec3 color, float g) {
	return pow(color, vec3(1.0/g));
}

${LambertDiffuse}

const mat4 depthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

float computeShadow(vec4 pos) {
      vec3 depth = pos.xyz / pos.w;
       float shadowValue = texture2D(shadowMap, depth.xy).r;
       depth.z *= 0.999;
       float step = step(depth.z, shadowValue);
       float mm = max(step, (1.-pos.x));
       return mm;
    }


const vec3 COLOR0 = 1.0 - vec3(198.0, 151.0, 75.0)/255.0;
const vec3 COLOR1 = vec3(1.0);

void main() {
	float mRoughness    = uRoughness;
	float mMetallic     = uMetallic;
	float mSpecular     = uSpecular;


	vec3 N 				= normalize( vWsNormal );
	vec3 V 				= normalize( vEyePosition );

	vec3 L = normalize(vLightRay);
	float lambertTerm = max(dot(N,-L),0.33);

	//****** THIS IS THE HORIZON linearDepth
	float _sinSun = sin(-uAngle);
	float _sunSkyPosition = sunSkyPosition(_sinSun);
	vec3 skyHue = mixMorningEvening(_sunSkyPosition);

	// deduce the diffuse and specular color from the baseColor and how metallic the material is
	vec3 diffuseColor	= uBaseColor - uBaseColor * mMetallic;
	diffuseColor *= baseColorAmount;
	vec3 specularColor	= mix( vec3( 0.08 * mSpecular ), uBaseColor, mMetallic );

	float colorOffset = smoothstep(12.0, 0.0, vWsPosition.y);

	float lambertDiffuseValue = min(lambertTerm + uLightIntensity, 1.0);//1.0;//lambertDiffuse(V, N);

	vec3 color;

	// sample the pre-filtered cubemap at the corresponding mipmap level
	// float numMips		= 6.0;
	// float mip			= numMips - 1.0 + log2(mRoughness);
	// vec3 lookup			= -reflect( V, N );
	// lookup				= fix_cube_lookup( lookup, 512.0, mip );
	// vec3 radiance		= pow( textureCubeLodEXT( uRadianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	// vec3 irradiance		= pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );

	// get the approximate reflectance
	float NoV			= saturate( dot( N, V ) );
	vec3 reflectance	= EnvBRDFApprox( specularColor, uRoughness4, NoV );

	// combine the specular IBL and the BRDF
	// vec3 diffTexture 	= texture2D(uDiffuse, vTextureCoord).rgb;
 //    vec3 diffuse  		= irradiance * diffuseColor + (irradiance * diffTexture + diffTexture);
 //    vec3 specular 		= radiance * reflectance;
	// color				= diffuse + specular;

	vec3 diffTexture 	= texture2D(uDiffuse, vTextureCoord).rgb;

	diffTexture += diffTexture * skyHue * 0.1;
	//vec3 ao 			= texture2D(uAoMap, vTextureCoord).rgb;
	//float ssao 			= smoothstep(uAoStrength, 1.0, ao.r);
	// ao  				= smoothstep(vec3(.5), vec3(1.0), ap);
	//color 				*= ssao;

	// apply the tone-mapping
	//color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	//color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 40.0 ) ) );

	// gamma correction
	//color				= pow( color, vec3( 1.0 / uGamma ) );

	// float opacity 		= smoothstep(0.0, 0.25, 1.0-uGreenOffset);
	// output the fragment color

	float ss = 0.;
	vec4 shdowPos = depthScaleMatrix * vec4(vWsPosition, 1.0);
	if(useDepth != 0){
		ss = min(computeShadow(shdowPos), 1.);
	}

    gl_FragColor		= vec4( diffTexture, 1.0 );
    //gl_FragColor		= vec4( vec3(ss), 1.0 );

}

`

export default F
