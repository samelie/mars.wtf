import Normals from './normals'
import Perlin from './perlin'
import Noise from './noise2D'
const P = `

#define SHADER_NAME REFLECTION_VERTEX
#define SPEED  0.2
#define BELL  40.
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
uniform float rotationX;
uniform float rotationY;
uniform float heightMap;
uniform float time;

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

${Noise}
${Normals}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main(void) {
	vec3 pos 				= aVertexPosition;
	vec2 st = aTextureCoord.xy;
	st.y *=2.0;
	st.y = fract(st.y);
	vec3 dv                 = texture2D( uHeightMap, st ).xyz;
	float _time = time;
	//float _s = sin(_time  * SPEED * (aTextureCoord.y +1.)) * 0.5 + 0.5;
	//tCoord.y = _s;
	//float _perlin = snoise(tCoord);

	float _heightTex  = dv.x;

	// float pct = 0.0;
 	// pct = 1.- distance(aTextureCoord,vec2(0.5, _s));
 	// pct *= BELL;

	// pos.z += pct;
	// pos.z -= BELL / 2.;

	pos.z += _heightTex * heightMap;
	//pos.z = pct;

	pos.yz 					= rotate(pos.yz, rotationX);
	//pos.xz 					= rotate(pos.xz, rotation);
	pos 					=  pos * scale + position;
	vec4 worldSpacePosition	= uModelMatrix * vec4(pos, 1.0);
    vec4 viewSpacePosition	= uViewMatrix * worldSpacePosition;


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