import BlendScreen from './blend_screen'
import Saturation from './saturation'
import {getFresnel} from './fresnel'
import Atmosphere from './atmosphere'

import {EnvBRDFApprox, FixCubeLookup, Uncharted2Tonemap} from './pbr'
const F = `

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform sampler2D 	uDiffuse;
uniform sampler2D textureHeight;
uniform sampler2D nextScene;
uniform sampler2D 	uAoMap;
uniform sampler2D 	uAlbedo;
uniform samplerCube uIrradianceMap;

uniform vec3		uBaseColor;
uniform vec3		position;

uniform float		uRoughness;
uniform float		uRoughness4;
uniform float		uMetallic;
uniform float		uSpecular;
uniform float 		uAoStrength;
uniform float		uExposure;
uniform float		uGamma;
uniform float		uGreenOffset;

uniform float		uTime;

uniform float baseColorAmount;
uniform float atmosphereIntensity;
uniform float fresnelBias;
uniform float fresnelAmp;
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

${getFresnel}

${Atmosphere}

${BlendScreen}

void main() {
	vec2 st 				= vTextureCoord.xy;

	float mRoughness    = uRoughness;
	float mMetallic     = uMetallic;
	float mSpecular     = uSpecular;


	vec3 N 				= normalize( vWsNormal);
	vec3 V 				= normalize( vEyePosition );

	vec3 L = normalize(vLightRay);
	float lambertTerm = max(dot(N,-L),0.33);
	
	// deduce the diffuse and specular color from the baseColor and how metallic the material is
	vec3 diffuseColor	= uBaseColor - uBaseColor * mMetallic;
	diffuseColor *= baseColorAmount;
	vec3 specularColor	= mix( vec3( 0.08 * mSpecular ), uBaseColor, mMetallic );

	float colorOffset = smoothstep(12.0, 0.0, vWsPosition.y);
	
	float lambertDiffuseValue = min(lambertTerm , 1.0);
	lambertDiffuseValue = 1.0; //***HACK
	vec3 color;

	// sample the pre-filtered cubemap at the corresponding mipmap level
	// float numMips		= 6.0;
	// float mip			= numMips - 1.0 + log2(mRoughness);
	// vec3 lookup			= -reflect( V, N );
	// lookup				= fix_cube_lookup( lookup, 512.0, mip );
	// vec3 radiance		= pow( textureCubeLodEXT( uIrradianceMap, lookup, mip ).rgb, vec3( 2.2 ) );
	// vec3 irradiance		= pow( textureCube( uIrradianceMap, N ).rgb, vec3( 1 ) );
	
	// // get the approximate reflectance
	// float NoV			= saturate( dot( N, V ) );
	// vec3 reflectance	= EnvBRDFApprox( specularColor, uRoughness4, NoV );
	
	// // combine the specular IBL and the BRDF
	vec3 diffTexture 	= texture2D(uDiffuse, vTextureCoord).rgb * lambertDiffuseValue;
 //    vec3 diffuse  		= irradiance * diffuseColor + (irradiance * diffTexture + diffTexture);
 //    vec3 specular 		= radiance * reflectance;
	// color				= diffuse + specular;

	color				= diffTexture;

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
	
	float fresenl = getFresnel(vEyePosition + position, vWsNormal, 0., fresnelBias, fresnelAmp);
	fresenl = max(fresenl, 0.0);
	float _fbmTime = uTime * 0.002;
	float _fbmIntensity = sin(_fbmTime) * 0.5 + 1.4;
	vec2 _pos = vec2(fract(st.x + _fbmTime * 0.04), fract(st.y + _fbmTime* 0.04));
	vec3 _atmosphere = atmosphere(_pos, _fbmTime, _fbmIntensity);
	_atmosphere *= atmosphereIntensity;
	vec3 finalColor = blendScreen_20_19(color, _atmosphere, 1.0);

	vec3 fresenlColor = finalColor * fresenl;// * atmosphereIntensity;
	finalColor *= fresenl;
	// float opacity 		= smoothstep(0.0, 0.25, 1.0-uGreenOffset);
	// output the fragment color
    gl_FragColor		= vec4( fresenlColor, 1.0 );
    gl_FragColor		= vec4( finalColor, 1.0 );
    //gl_FragColor		= vec4( vEyePosition + position, 1.0 );
    //gl_FragColor		= vec4( vec3(fresenl), 1.0 );
    //	gl_FragColor		= vec4( vec3(lambertTerm), 1.0 );

}

`

export default F