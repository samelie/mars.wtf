const F = `

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform float rotation;
uniform sampler2D 	uHeightMap;
//uniform sampler2D 	uShadowmap;

uniform vec3 uLightPosition;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;

varying vec3 vPosition;
varying vec2 vTextureCoord;
varying vec3 vNormal; 
varying vec3 vLightRay;
varying vec3 vEyeVec;

void main() {
	//vec3 shadowCoord =(v_PositionFromLight.xyz/v_PositionFromLight.w) / 2.0 + 0.5; 
	//gl_FragColor = vec4(vTextureCoord, sin(rotation) * .5 + .5, 1.0);

	vec4 dv = texture2D( uHeightMap, vTextureCoord );
	vec3 L = normalize(vLightRay);
	vec3 N = normalize(vNormal);
	float lambertTerm = max(dot(N,-L),0.33);
	vec4 Id = uLightDiffuse * dv;// * lambertTerm; 

	//vec3 rgbaDepth  = texture2D( uShadowmap, vTextureCoord ).xyz;
	//float visibility = (shadowCoord.z > depth + 0.005) ? 0.7:1.0;

	gl_FragColor = Id;//vec4(1.0, 0.0, 0.0, 1.0);
}

`


// float depth = rgbaDepth.r;
// float visibility = (shadowCoord.z > depth + 0.005) ? 0.7:1.0;
// 46 ' gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);\n' +

export default F