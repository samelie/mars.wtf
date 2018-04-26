const circle = 

`float circle(in vec2 _st, in float _radiusX, in float _radiusY, in float feather, in float amp){
    vec2 dist = _st - vec2(0.5);
	return 1.-smoothstep(_radiusX-(_radiusX*feather),
                         _radiusY+(_radiusY*feather),
                         dot(dist,dist)*amp);
}`

export {circle}