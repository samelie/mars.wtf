const TILE_FBM = `

#define FBM_NOISE_RES 2

//----------------------------------------------------------------------------------------
float Hash(in vec2 p, in float scale)
{
	// This is tiling part, adjusts with the scale...
	p = mod(p, scale);
	return fract(sin(dot(p, vec2(27.16898, 38.90563))) * 5151.5473453);
}

//----------------------------------------------------------------------------------------
float Noise(in vec2 p, in float scale )
{
	vec2 f;
	
	p *= scale;

	
	f = fract(p);		// Separate integer from fractional
    p = floor(p);
	
    f = f*f*(3.0-2.0*f);	// Cosine interpolation approximation
	
    float res = mix(mix(Hash(p, 				 scale),
						Hash(p + vec2(1.0, 0.0), scale), f.x),
					mix(Hash(p + vec2(0.0, 1.0), scale),
						Hash(p + vec2(1.0, 1.0), scale), f.x), f.y);
    return res;
}

//----------------------------------------------------------------------------------------
float fBm(in vec2 p, in float time, in float amp)
{
	float _s = sin(time * .7);
	float _c = cos(time * .45);
    p += vec2(_s, _c)*(.01);
    p += vec2(_s, _c)*(.01);
    p += vec2(_s, _c)*(.01);
	float f = 0.0;
	// Change starting scale to any integer value...
	float scale = 7.;
    p = mod(p, scale);
	
	for (int i = 0; i < FBM_NOISE_RES; i++)
	{
		f += Noise(p, scale) * amp;
		amp *= .5;
		// Scale must be multiplied by an integer value...
		scale *= 2.;
	}
	// Clamp it just in case....
	return min(f, 1.0);
}`

export default TILE_FBM