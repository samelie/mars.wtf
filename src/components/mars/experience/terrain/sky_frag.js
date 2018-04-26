import {
    sunSkyPosition,
    SUN_MORNING,
    SUN_EVENING,
    mixMorningEvening
} from './sun'

import { circle } from './shapes'
import FBM from './tile_fbm'

const F = `

// basic.frag

#define SHADER_NAME SIMPLE_TEXTURE
#define SUN_RADIUS 0.000001
#define SUN_AMP 1. //HIgh is smaller
#define SUN_SPEED 0.08
#define SUN_INTENS 0.2

precision highp float;
uniform sampler2D uHorizon;
uniform float uTime;
uniform float uAngle;
uniform float washOutFactor;
uniform vec3 sunTarget;
uniform vec3 sunPosition;
varying vec2 vTextureCoord;

${SUN_MORNING}
${SUN_EVENING}
${circle}
${sunSkyPosition}
${mixMorningEvening}

${FBM}

float qinticIn(float t) {
  return pow(t, 5.0);
}


void main(void) {
	vec2 st = vTextureCoord;
	vec4 color = texture2D(uHorizon, vTextureCoord);
	float noise = fBm(st, uTime, 0.5);

	//float sunAngle = dot(normalize(sunTarget), -normalize(sunPosition));
	float _angle = uAngle + ((noise * 2. - 1.));
	float _sinSun = sin(-_angle);
	vec2 translateSun = vec2(cos(-_angle),_sinSun);
	//vec2 translateSun = vec2(sunPosition.xy);
	st.x+=0.25; //90degs
	st+=translateSun*SUN_SPEED;

	float _sunSkyPosition = sunSkyPosition(_sinSun);
	vec3 skyHue = mixMorningEvening(_sunSkyPosition);

	vec3 sunColor = vec3(circle(st, SUN_RADIUS / 8., SUN_RADIUS, 0.5 ,SUN_AMP));

	float sunGlowSlope = qinticIn(circle(st, 0.05 / 8., 0.05, 100. ,500.));
	vec3 sunGlow = skyHue * vec3(sunGlowSlope);
	sunGlow *= SUN_INTENS;
	sunGlow += sunColor * (skyHue*vec3(.8,.8,.8));

	skyHue += sunGlow;

	vec3 finalColor = mix(color.rgb, skyHue, clamp(_sunSkyPosition, 0.3, .5));

	finalColor += sunColor * (skyHue*vec3(.8,.8,.8));

  vec3 washOut = vec3(skyHue) * washOutFactor;

    //gl_FragColor = vec4(color.rgb,1.0);
    //gl_FragColor = vec4(skyHue + sunGlow,1.0);
    //gl_FragColor = vec4(vec3(noise),1.0);
    //gl_FragColor = vec4(skyHue,1.0);
    gl_FragColor = vec4((finalColor *(1. - washOutFactor)) + washOut, 1.0);//vec4(1.0, 0.0, 0.0, 1.0);
}

`

export default F