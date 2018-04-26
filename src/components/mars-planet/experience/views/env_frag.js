const F = `

// basic.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureBlur;
uniform float offset;

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    vec4 colorBlur = texture2D(textureBlur, vTextureCoord);

    //gl_FragColor = mix(color, colorBlur, offset);
    gl_FragColor = vec4(vec3(color),1.0);
}

`

export default F