const getFresnel = 

`

float getFresnel( vec3 cameraPosition , vec3 wsNormal, float bias, float scale, float power)
{
    return bias + scale * pow(1.0 + dot(cameraPosition, wsNormal), power);
}


`
export {getFresnel}