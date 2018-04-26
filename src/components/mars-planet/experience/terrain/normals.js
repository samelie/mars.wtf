import MAP from './map'


const N = 

`
	${MAP}
	
	const float SHIFT = .001;

	vec3 calculateNormals(in sampler2D texture, in vec2 texCoord)
	{
		const float XZScale = 2.0;
		const float YSCale = 1.0;
		float gap = map(SHIFT, 0.0, 1.0, 0.0, 2.0);
		// float gap = SHIFT;

		vec3 pixelCurr  = vec3(texCoord.x, texture2D(texture, texCoord).r, texCoord.y);
		vec3 pixelRight = vec3(texCoord.x+gap, texture2D(texture, texCoord+vec2(SHIFT, 0.0)).r, texCoord.y);
		vec3 pixelUp    = vec3(texCoord.x, texture2D(texture, texCoord+vec2(0.0, SHIFT)).r, texCoord.y+gap);

		pixelCurr  *= vec3(XZScale, YSCale, XZScale);
		pixelRight *= vec3(XZScale, YSCale, XZScale);
		pixelUp    *= vec3(XZScale, YSCale, XZScale);

		vec3 vRight = pixelRight - pixelCurr;
		vec3 vUp = pixelUp - pixelCurr;

		// vec3 normal = (normalize(cross(vRight, vUp)) + 1.0) * .5;
		vec3 normal = (normalize(cross(vUp, vRight)) + 1.0) * .5;
		return normal;
	}
`

export default N