import BLEND from './blend'
import FBM from './fbm'
import R from './random'

const F = `

// basic.frag

#define SHADER_NAME SIMPLE_TEXTURE
precision highp float;

${BLEND}

${FBM}

${R}

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureNebula;
uniform float time;

void main(void) {
    vec2 newUv = vTextureCoord;
    vec2 st = vTextureCoord;

	// float t = time * 0.0007;
 //    vec2 r = vec2(fbm4(newUv + t * 0.7 - newUv.x - newUv.y, 0.4), fbm4(newUv -t * 0.4, 0.4));
 //    newUv.x *= .5+r.x;
 //    newUv.y *= .5+r.y;

 //    newUv.x = clamp(newUv.x, 0., 1.);
 //    newUv.y = clamp(newUv.y, 0., 1.);

	
	float _fbmTime = time * 0.004;
	float _fbmIntensity = sin(_fbmTime) * 0.5 + 0.4;
	float fbm = (fBm(st, _fbmTime, _fbmIntensity) - 0.5) * 0.009;

    vec4 color = texture2D(texture, vec2(st.x + fbm, st.y + fbm));
 	//vec4 colorBlur = texture2D(textureNebula, newUv);
	//vec3 b = blendOverlay_8_12(color.rgb, colorBlur.rgb, 1.);
    //gl_FragColor = mix(color, colorBlur, offset);
	

    //gl_FragColor = vec4(vec3(fbm),1.0);
    gl_FragColor = vec4(color.rgb,1.0);
}

`

export default F