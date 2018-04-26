const M
=
	
`float map(float value, float sx, float sy, float tx, float ty) {
		float p = (value - sx) / ( sy - sx);
		return tx + p * ( ty - tx);
	}`


export default M