const F = `

// basic.frag

#define SHADER_NAME BASIC_FRAGMENT

precision highp float;
uniform float time;

uniform vec3 uDiffuse;

varying vec3 vNormal;
varying vec2 vTextureCoord;

// uniform sampler2D texture;

void main(void) {
    gl_FragColor = vec4(uDiffuse, 1.0);
}

`

export default F