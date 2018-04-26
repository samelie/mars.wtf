import Atmosphere from './atmosphere'
import BlendScreen from './blend_screen'
import Noise from './perlin'
const F = `

// basic.frag

#define SHADER_NAME SIMPLE_TEXTURE
precision highp float;

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D nextScene;
uniform float time;
uniform int noiseAtmosphere;
uniform float fade;

uniform float atmosphereIntensity;

${Atmosphere}

${BlendScreen}

${Noise}

void main(void) {
    vec2 newUv = vTextureCoord;

    vec3 color = texture2D(texture, vTextureCoord).rgb;
    vec3 nColor = texture2D(nextScene, vTextureCoord).rgb;
	float _m = sin(time * 0.01)*.5 + 0.5;
    vec3 _out = mix(color, nColor, fade);

    vec3 atmosphere = mix(ATMOSPHERE_COLOR_RED, ATMOSPHERE_COLOR, newUv.x) * atmosphereIntensity;
	
	float _perlin = 1.;

	if(noiseAtmosphere > 0){
	 	_perlin = noise(newUv + time * 0.02, 1.) + .5;
	}

	atmosphere *= _perlin;

    vec3 finalColor = blendScreen_20_19(_out, atmosphere, 1.);

    gl_FragColor = vec4(_out,1.0);
    gl_FragColor = vec4(finalColor,1.0);
}

`

export default F