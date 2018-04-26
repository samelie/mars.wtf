const SCREEN  = `
float blendScreen_20_19(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen_20_19(vec3 base, vec3 blend) {
	return vec3(blendScreen_20_19(base.r,blend.r),blendScreen_20_19(base.g,blend.g),blendScreen_20_19(base.b,blend.b));
}

vec3 blendScreen_20_19(vec3 base, vec3 blend, float opacity) {
	return (blendScreen_20_19(base, blend) * opacity + blend * (1.0 - opacity));
}`

export default SCREEN