import {
    EnvBRDFApprox,
    FixCubeLookup,
    Uncharted2Tonemap,
    correctGamma,
    COLOR0,
    COLOR1,
} from './pbr'

import {
    sunSkyPosition,
    SUN_MORNING,
    SUN_EVENING,
    mixMorningEvening
} from './sun'

import {
    changeContrast,
} from './color'

import Blend from './blend'

import HorizonBlend from './horizon'
import Bokeh from './bokeh'
import Blur from './blur'
import { applyFog } from './fog'

import { spotFrag } from '../rad/SpotLight'

const F = `

#extension GL_EXT_shader_texture_lod : enable
#define EXPOSURE 4.6
#define GAMMA 1.
#define FOG 0.8
//*** USED FOR THE HORIZON
#define NEAR -1024.
#define FAR 1024.
#define SHADOW_INTENSITY .7


precision highp float;

uniform float rotation;
uniform sampler2D 	uHeightMap;
uniform sampler2D 	uAoMap;

uniform mat4 uViewMatrix;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform vec3 baseColor;
uniform vec3 uLightColor;
uniform vec3 darkColor;
uniform vec3 fogColor;

uniform vec3 sunPosition;
uniform vec3 position;

uniform int sceneDepth;
uniform float heightMap;
uniform float washOutFactor;
uniform float uAngle;

varying vec3        vNormal;
varying vec3        vPosition;
varying vec3		vEyePosition;
varying vec3		vWsNormal;
varying vec3		vWsPosition;
varying vec3		vVertexPosition;

varying vec2 		vTextureCoord;

varying vec3 vLightRay;
varying vec3 vEyeVec;


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
${correctGamma}
${COLOR0}
${COLOR1}

${changeContrast}

${Blend}

//${spotFrag}

${SUN_MORNING}
${SUN_EVENING}
${sunSkyPosition}
${mixMorningEvening}

//${applyFog}

${HorizonBlend}


void main() {
	vec2 st = vTextureCoord;

	//vec4 dv = texture2D( uHeightMap, vTextureCoord );
	vec3 L = normalize(sunPosition);
	vec3 N = normalize(vNormal * 2.0 - 1.0);

	L.y *= -1.;
	L.x *= -1.;
	L.x *= 4.;
	float _lDot = dot(N, -L);
	float lambertTerm = max(_lDot,.1);


	//float shadowValue = min(computeShadow(), 1.);

	// vec3 E = normalize(vEyePosition);
	// vec3 P = normalize(vPosition);
	// vec3 _pp = P - E;


	//****** THIS IS THE HORIZON linearDepth
	float _sinSun = sin(-uAngle);
	float _sunSkyPosition = sunSkyPosition(_sinSun);
	vec3 skyHue = mixMorningEvening(_sunSkyPosition);

	//****** THIS IS FOCAL LENGTH
	float _near = NEAR + position.z;
	float _far = FAR + position.z;
	float linearDepth = clamp(length(vPosition) / (_far - _near), 0., .9);

	//vec3 mixFogColor = mix(mix(fogColor, baseColor, clamp(_sunSkyPosition, 0., 1.)), skyHue, 0.2);

	//vec3 color = mix(skyHue, vec3(1.), 0.2);
	vec2 _st = st;
	_st.y *=2.0;
	_st.y = fract(_st.y);
	float heightMod  = texture2D( uHeightMap, _st ).x;
	//****reduce the height 0.5-1.0
	float heightMapReduced = heightMod * .5 + 0.5;

	//**** color contrast from the textures
	st.y *= 2.0;
	st.y = fract(st.y);
	vec3 color 		 = texture2D(uAoMap, st).rgb;
	vec3 colorLambert = color * (lambertTerm * 0.2);
	color +=  colorLambert;
	color = clamp(color, 0., 1.);

	color *= changeContrast(color, heightMod * 2.5);
	float ssao 			= smoothstep(0.02, 1.0, heightMapReduced);
	color 				*= ssao;

	color += 0.2;

	vec3 gradientMap = mix(darkColor, lightColor, 1.-heightMod);
	gradientMap *= max((lambertTerm - 0.3),.4);

	vec3 gradientWithSky = mix(skyHue, gradientMap, 0.9);

	vec3 nColor = color * gradientWithSky;
	nColor = changeContrast(nColor, 0.1);
	//gradientMap = mix(skyHue, gr)
	//gradientMap + mix(skyHue, baseColor, clamp(_sunSkyPosition * 0.8, 0., 0.8 ));

	//color *= gradientMap;

	//color += color * lambertTerm;
	//color *= lambertTerm;
	//color *= clamp((1. - heightMod),0.1, 1.0);

	//vec3 nColor = blendScreen_20_19(color, gradientMap);

	//nColor = mix(nColor, baseColor, clamp(_sunSkyPosition * 0.8, 0., 0.8 ));

	//nColor *= min(shadowValue + step(sunPosition.y, heightMod * heightMap) + SHADOW_INTENSITY, 1.0);
	//********* NO GAMMA
	// nColor				= Uncharted2Tonemap( nColor * EXPOSURE );
	// nColor				= nColor * ( 1.0 / Uncharted2Tonemap( vec3( 40.0 ) ) );
	// nColor				= pow( nColor, vec3( 1.0 / GAMMA ) );

	//vec3 finalColor =  applyFog(nColor, mixFogColor, linearDepth * 0.5, FOG);
	vec3 horizonColor = skyHue * linearDepth;
	nColor += horizonColor;
	//nColor *= (1. - linearDepth);

	nColor += (skyHue * (1. - horizonBlend(vTextureCoord)) * .2);
	//finalColor += (skyHue *= (linearDepth));

	vec3 washOut = vec3(skyHue) * washOutFactor;

	gl_FragColor = vec4((nColor *(1. - washOutFactor)) + washOut, 1.0);//vec4(1.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(vec3(heightMod), 1.0);//vec4(1.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(vec3(horizonColor), 1.0);//vec4(1.0, 0.0, 0.0, 1.0);
	//gl_FragColor = vec4(vec3((1. - linearDepth)),1.0);
}

`


// float depth = rgbaDepth.r;
// float visibility = (shadowCoord.z > depth + 0.005) ? 0.7:1.0;
// 46 ' gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);\n' +

export default F
