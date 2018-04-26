const F = `

// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision highp float;
varying vec2 vTextureCoord;
uniform float time;
uniform sampler2D texture;

void main(void) {
	float n = 1.0;
	float f = 2000.0;
	float z = texture2D(texture, vTextureCoord.st).x;
	vec3 rrr = texture2D(texture, vTextureCoord.st).rgb;
	float grey = (2.0 * n) / (f + n - z*(f-n));
	vec4 color = vec4(grey, grey, grey, 1.0);
	gl_FragColor = color;
	//gl_FragColor = vec4(rrr, 1.0);
    //gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
}

`

export default F