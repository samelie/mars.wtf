const changeContrast = `

vec3 changeContrast( vec3 color, float amount )
{
	return (color - 0.5) * (amount + 1.0) + 0.5;
}

`

export {
	changeContrast,
}

