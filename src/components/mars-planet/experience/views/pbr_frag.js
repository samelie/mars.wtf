import Saturation from './saturation'
import {EnvBRDFApprox, FixCubeLookup, Uncharted2Tonemap} from './pbr'
const F = `

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform sampler2D 	uDiffuse;
uniform sampler2D textureHeight;
uniform sampler2D 	uAoMap;
uniform sampler2D 	uAlbedo;
uniform samplerCube uIrradianceMap;

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
//uniform float uLightIntensity;

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

${Saturation}

// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;


${Uncharted2Tonemap}
${EnvBRDFApprox}
${FixCubeLookup}


vec3 correctGamma(vec3 color, float g) {
	return pow(color, vec3(1.0/g));
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
	
	// deduce the diffuse and specular color from the baseColor and how metallic the material is
	vec3 diffuseColor	= uBaseColor - uBaseColor * mMetallic;
	diffuseColor *= baseColorAmount;
	vec3 specularColor	= mix( vec3( 0.08 * mSpecular ), uBaseColor, mMetallic );

	float colorOffset = smoothstep(12.0, 0.0, vWsPosition.y);
	
	float lambertDiffuseValue = min(lambertTerm , 1.0);

	vec3 color;

	// sample the pre-filtered cubemap at the corresponding mipmap level
	float numMips		= 6.0;
	float mip			= numMips - 1.0 + log2(mRoughness);
	vec3 lookup			= -reflect( V, N );
	lookup				= fix_cube_lookup( lookup, 512.0, mip );
	vec3 radiance		= pow( textureCubeLodEXT( uIrradianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	vec3 irradiance		= pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );
	
	// get the approximate reflectance
	float NoV			= saturate( dot( N, V ) );
	vec3 reflectance	= EnvBRDFApprox( specularColor, uRoughness4, NoV );
	
	// combine the specular IBL and the BRDF
	vec3 diffTexture 	= texture2D(uDiffuse, vTextureCoord).rgb ;
    vec3 diffuse  		= irradiance * diffuseColor + (irradiance * diffTexture + diffTexture);
    vec3 specular 		= radiance * reflectance;
	color				= diffuse + specular;
	
	vec3 ao 			= texture2D(uAoMap, vTextureCoord).rgb;
	float ssao 			= smoothstep(uAoStrength, 1.0, ao.r);
	// ao  				= smoothstep(vec3(.5), vec3(1.0), ap);
	color 				*= ssao;

	// apply the tone-mapping
	color				= Uncharted2Tonemap( color * uExposure );
	// white balance
	color				= color * ( 1.0 / Uncharted2Tonemap( vec3( 40.0 ) ) );
	
	// gamma correction
	color				= pow( color, vec3( 1.0 / uGamma ) );

	// float opacity 		= smoothstep(0.0, 0.25, 1.0-uGreenOffset);
	// output the fragment color
    gl_FragColor		= vec4( diffTexture, 1.0 );

}

`

export default F