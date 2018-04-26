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

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

uniform vec3 position;
uniform vec3 scale;
uniform float rotation;
uniform float heightMap;

varying vec2 vTextureCoord;

varying vec3 vLightRay;
varying vec3 vEyeVec;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;


vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 pos 				= aVertexPosition;
	// pos.yz 					= rotate(pos.yz, 0.05);
	pos.xz 					= rotate(pos.xz, rotation);
	pos 					=  pos * scale + position;
	pos.y 					+= heightMap;
	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

    vec4 vertex = viewSpacePosition * vec4(pos, 1.0);
 	vec4 light = vec4(uLightPosition,1.0);
 	vNormal = vec3(viewSpacePosition * vec4(aNormal, 1.0));
 	vLightRay = vertex.xyz-light.xyz;
 	vEyeVec = -vec3(vertex.xyz);

	
    vNormal					= uNormalMatrix * aNormal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;
	
	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );
	
    gl_Position				= uProjectionMatrix * viewSpacePosition;

	vTextureCoord			= aTextureCoord;
}
`

export default P