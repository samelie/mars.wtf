import FBM from './fbm'
import R from './random'
const F = `

const vec3 ATMOSPHERE_COLOR = vec3(.607843137, .525490196, .564705882);
const vec3 ATMOSPHERE_COLOR_RED = vec3(.62745098, .250980392, .223529412);

${FBM}

${R}

vec3 atmosphere(in vec2 p, in float time, in float amp){
	float fbm = fBm(p, time, amp);
	vec3 baseColor = ATMOSPHERE_COLOR_RED * fbm;
	vec3 highlightsColor = ATMOSPHERE_COLOR * (1. - fbm);
	vec3 color = baseColor + highlightsColor;
	float _r = random(p);
	vec3 noise = vec3 (_r,_r,_r);
	vec3 final = mix(noise, color, 0.92);
	return final;
}

`
const SUN_MORNING = `
	
`

const SUN_EVENING = `
	const vec3 SUN_EVENING = vec3(1.0, 0.8, 0.8);
`

export default F