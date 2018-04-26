import Normals from './normals'
import {spotVert} from '../rad/SpotLight'
const P = `

#define SHADER_NAME REFLECTION_VERTEX
#define BELL  20.

precision highp float;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform sampler2D 	uHeightMap;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform vec3 position;
uniform vec3 scale;
uniform float rotation;
uniform float heightMap;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

varying vec2 vTextureCoord;

varying vec3 vLightRay;
varying vec3 vEyeVec;
varying vec3 vVertexPosition;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;

float rand(float n){return fract(sin(n) * 43758.5453123);}

${spotVert}

${Normals}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 pos 				= aVertexPosition;
	vec3 dv                 = texture2D( uHeightMap, aTextureCoord ).xyz;

	//********CAUSES BAD JUMP
	// float pct = 0.0;
 //    pct = 1.- distance(aTextureCoord,vec2(0.5, 0.));
 //    pct *= BELL;

	// pos.z = pct;
	// pos.z -= BELL;

	pos.z 					+= dv.x * heightMap;
	pos.yz 					= rotate(pos.yz, rotation);
	//pos.xz 					= rotate(pos.xz, rotation);
	pos 					=  pos * scale + position;
	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;

    //vec4 vertex = viewSpacePosition * vec4(pos, 1.0);
 	//vec4 light = vec4(uLightPosition,1.0);
 	//vNormal = vec3(viewSpacePosition * vec4(aNormal, 1.0));
 	//vLightRay = vertex.xyz-light.xyz;
 	//vEyeVec = -vec3(vertex.xyz);

 	setupLight(worldSpacePosition.xyz);
	setupShadow(worldSpacePosition);

	vVertexPosition = pos;

    vNormal					= uNormalMatrix * aNormal;
    vPosition				= viewSpacePosition.xyz;
	vWsPosition				= worldSpacePosition.xyz;

	vec4 eyeDirViewSpace	= viewSpacePosition - vec4( 0, 0, 0, 1 );
	vEyePosition			= -vec3( uModelViewMatrixInverse * eyeDirViewSpace.xyz );
	vWsNormal				= normalize( uModelViewMatrixInverse * vNormal );

    gl_Position				= uProjectionMatrix * viewSpacePosition;

    vNormal = calculateNormals(uHeightMap, aTextureCoord);

	vTextureCoord			= aTextureCoord;
}
`

export default P
