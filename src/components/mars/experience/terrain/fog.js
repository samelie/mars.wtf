const applyFog =

`

vec3 applyFog( in vec3  rgb, vec3 fogColor, in float distance, in float amp ) 
{
    float fogAmount = 1.0 - exp( -distance * amp);
    return mix( rgb, fogColor, fogAmount );
}

`

export {
	applyFog
}