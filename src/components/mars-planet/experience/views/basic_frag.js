const F = `

// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision highp float;
varying vec2 vTextureCoord;
uniform float time;
// uniform sampler2D texture;

void main(void) {
    gl_FragColor = vec4(vec3(1.0, 0.0, 0.0), 1.0);
}

`

export default F