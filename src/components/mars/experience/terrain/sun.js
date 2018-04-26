const sunSkyPosition = `
float sunSkyPosition(in float _sinSun){
	float _sunSkyPosition = -1. * _sinSun  * (1. - (_sinSun - step(_sinSun, 0.)));
	return _sunSkyPosition;
}
`
const SUN_MORNING = `
	const vec3 SUN_MORNING = vec3(.819607843, .635294118, .431372549);
`

const SUN_EVENING = `
	const vec3 SUN_EVENING = vec3(.116862745, .126666667, .22745098);
`

const mixMorningEvening = `
	vec3 mixMorningEvening(in float amount){
		vec3 skyHue = mix(SUN_EVENING, SUN_MORNING, amount);
		return skyHue;
	}
`
export {
	sunSkyPosition,
	SUN_MORNING,
	SUN_EVENING,
	mixMorningEvening
}