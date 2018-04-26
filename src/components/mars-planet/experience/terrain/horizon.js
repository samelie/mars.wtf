const HORIZON_BLEND = `
float wiggleWaveLeft(vec2 st, float size, float intensity) {
	size *= 2.0 - 1.0;
	intensity -= 0.5;
	return smoothstep(size, 0.636, 1.080 - abs(intensity*(st.x+st.y*0.0*-intensity - 0.5)));
}

float wiggleWaveRight(vec2 st, float size, float intensity) {
	size *= 2.0 - 1.0;
	intensity -= 0.5;
	return smoothstep(size, 0.636, 1.048 - abs(intensity*(st.x+st.y*0.*-intensity - -0.508)));
}

float wiggleWaveTop(vec2 st, float size, float intensity) {
	size *= 2.0 - 1.0;
	intensity -= 0.5;
	return smoothstep(size, 0.780, 1.144 - abs(intensity*(st.y*-5.616 - 6.428)));
}

float wiggleWaveBottom(vec2 st, float size, float intensity) {
	size *= 2.0 - 1.0;
	intensity -= 0.5;
	return smoothstep(size, 0.780, 1.224 - abs(intensity*(st.y*-4.720 - 0.204)));
}

float horizonBlend(vec2 st){
	vec2 leftBlurPos = vec2(0.500,0.00)-st;
    float leftBlur = wiggleWaveLeft(leftBlurPos, 1.248, 1.744);
    vec2 rightBlurPos = vec2(0.500,0.00)-st;
    float rightBlur = wiggleWaveRight(rightBlurPos, 1.248, 1.744);
    vec2 topBlurPos = vec2(0.980,-0.120)-st;
    float topBlur = wiggleWaveTop(topBlurPos, 1.248, 0.224);
    vec2 bottomBlurPos = vec2(0.980,-0.120)-st;
    float bottomBlur = wiggleWaveBottom(bottomBlurPos, 1.248, 0.224);

	float finalC = topBlur * leftBlur * bottomBlur * rightBlur;
	return finalC;
}

`

export default HORIZON_BLEND