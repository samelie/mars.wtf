const P = `

#define SHADER_NAME REFLECTION_VERTEX

precision highp float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform vec3 position;
uniform vec3 scale;
uniform float rotation;
uniform float heightMap;

void main(void) {
  vec3 pos        = aVertexPosition;
  pos           =  pos * scale + position;
  vec4 worldSpacePosition = uModelMatrix * vec4(pos, 1.0);
  vec4 viewSpacePosition  = uViewMatrix * worldSpacePosition;

  vNormal = vec3(viewSpacePosition * vec4(aNormal, 1.0));

  gl_Position       = uProjectionMatrix * viewSpacePosition;

  vTextureCoord     = aTextureCoord;
}
`

export default P