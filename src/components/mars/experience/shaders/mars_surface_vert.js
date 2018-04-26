const F = `

// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform vec3 position;
uniform vec3 scale;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;
varying vec2 vTextureCoord;

void main(void) {
	vec3 pos 				= aVertexPosition;
	pos 					=  pos * scale + position;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vNormal = aNormal;
    vTextureCoord = aTextureCoord;
}

`

export default F