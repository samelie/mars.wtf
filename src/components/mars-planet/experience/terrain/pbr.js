const EnvBRDFApprox = `

// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec3 EnvBRDFApprox( vec3 SpecularColor, float Roughness, float NoV )
{
	const vec4 c0 = vec4( -1, -0.0275, -0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, -0.04 );
	vec4 r = Roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( -9.28 * NoV ) ) * r.x + r.y;
	vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
	return SpecularColor * AB.x + AB.y;
}

`

const FixCubeLookup = 
`

// http://the-witness.net/news/2012/02/seamless-cube-map-filtering/
vec3 fix_cube_lookup( vec3 v, float cube_size, float lod ) {
	float M = max(max(abs(v.x), abs(v.y)), abs(v.z));
	float scale = 1.0 - exp2(lod) / cube_size;
	if (abs(v.x) != M) v.x *= scale;
	if (abs(v.y) != M) v.y *= scale;
	if (abs(v.z) != M) v.z *= scale;
	return v;
}

`

const Uncharted2Tonemap =  `
vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

`

const correctGamma = 

`
vec3 correctGamma(vec3 color, float g) {
	return pow(color, vec3(1.0/g));
}

`

const COLOR0  = `const vec3 COLOR0 = 1.0 - vec3(198.0, 151.0, 75.0)/255.0;`
const COLOR1 = `const vec3 COLOR1 = vec3(1.0);`


export {
	Uncharted2Tonemap,
	EnvBRDFApprox,
	FixCubeLookup,
	correctGamma,
	COLOR0,
	COLOR1,
}

