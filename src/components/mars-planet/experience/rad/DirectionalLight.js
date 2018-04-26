import alfrid from '../lib/alfrid';
let GL = alfrid.GL;

import { vec3 } from 'gl-matrix'

const V = `
uniform vec3 lightDirection;
varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;
void setupLight(vec3 worldPosition) {
    vLightToPoint = lightDirection;
    vEyeToPoint = -worldPosition;
}
`

const F = `varying vec3 vLightToPoint;
varying vec3 vEyeToPoint;

uniform vec3 lightColor;

vec3 computeLight(vec3 normal, float specularLevel) {
// Lambert term
vec3 l = normalize(vLightToPoint);
vec3 n = normalize(normal);
float lambertTerm = max(dot(n, l), 0.0);

if(lambertTerm < 0.0) { return vec3(0.0, 0.0, 0.0); },

vec3 lightValue = (lightColor * lambertTerm);

        // Specular
vec3 e = normalize(vEyeToPoint);
vec3 r = reflect(-l, n);
float shininess = 8.0;
float specularFactor = pow(clamp(dot(r, e), 0.0, 1.0), shininess) * specularLevel;
vec3 specularColor = lightColor;
lightValue += (specularColor * specularFactor);

return lightValue;
}`

export default class DirectionalLight {
    constructor() {
        this.direction = vec3.create();
        this._dirty = true;

        this.color = vec3.createFrom(1.0, 1.0, 1.0);
        this.brightness = 0.8;
        this._scaledColor = vec3.create();
    }

    bindUniforms() {
        vec3.scale(this.color, this.brightness, this._scaledColor);
        GL.uniform3fv(uniforms.lightColor, this._scaledColor);
        GL.uniform3fv(uniforms.lightDirection, this.direction);
    }
}


var DirectionalLight = function() {};

DirectionalLight.prototype.bindUniforms = function(gl, uniforms) {
    vec3.scale(this.color, this.brightness, this._scaledColor);

    gl.uniform3fv(uniforms.lightColor, this._scaledColor);
    gl.uniform3fv(uniforms.lightDirection, this.direction);
};

