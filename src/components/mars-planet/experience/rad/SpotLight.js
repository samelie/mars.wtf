import alfrid, { FrameBuffer } from '../lib/alfrid';
let GL = alfrid.GL;
let gl = GL
import { vec3, mat4 } from 'gl-matrix'

// Shaders
const spotVert = `
    uniform vec3 lightPosition;
    uniform mat4 lightViewMat;
    uniform mat4 lightProjectionMat;

    varying vec3 vLightToPoint;
    varying vec3 vEyeToPoint;
    varying vec4 vShadowPosition;

    const mat4 depthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

    void setupLight(vec3 worldPosition) {
       vLightToPoint = lightPosition - worldPosition;
       vEyeToPoint = -worldPosition;
    }

    void setupShadow(vec4 worldPosition) {
       //vShadowPosition = depthScaleMatrix * lightProjectionMat * lightViewMat * worldPosition;
       vShadowPosition = depthScaleMatrix * lightProjectionMat * lightViewMat * worldPosition;
    }
`

const spotFrag = `    
    varying vec3 vLightToPoint;
    varying vec3 vEyeToPoint;
    varying vec4 vShadowPosition;

    uniform vec3 lightPosition;
    uniform sampler2D shadowMap;
    uniform vec3 lightColor;
    uniform float lightRadius;

    uniform vec3 lightSpotDirection;
    uniform float lightSpotInnerAngle;
    uniform float lightSpotOuterAngle;

    vec3 computeLight(vec3 normal, float specularLevel) {
    // Lambert term
       vec3 l = normalize(vLightToPoint);
       vec3 n = normalize(normal);
       float lambertTerm = max(dot(n, l), 0.0);

    if(lambertTerm < 0.0) { return vec3(0.0, 0.0, 0.0); }

    // Light attenuation
       float lightDist = length(vLightToPoint);
       float d = max(lightDist - lightRadius, 0.0) / lightRadius + 1.0;
       float distAttn = 1.0 / (d * d);

    // Spot attenuation
       vec3 sd = normalize(lightSpotDirection);
       float spotAngleDelta = lightSpotInnerAngle - lightSpotOuterAngle;
       float spotAngle = dot(-l, sd);
       float spotAttn = clamp((spotAngle - lightSpotOuterAngle) / spotAngleDelta, 0.0, 1.0);

       vec3 lightValue = (lightColor * lambertTerm * distAttn * spotAttn);

    // Specular
       vec3 e = normalize(vEyeToPoint);
       vec3 r = reflect(-l, n);
       float shininess = 8.0;
       float specularFactor = pow(clamp(dot(r, e), 0.0, 1.0), shininess) * specularLevel;
       vec3 specularColor = lightColor;
       lightValue += (specularColor * specularFactor);

       return lightValue;//vec3(lambertTerm);
    }

    float computeShadow() {
       vec3 depth = vShadowPosition.xyz / vShadowPosition.w;
       float shadowValue = texture2D(shadowMap, depth.xy).r;
       depth.z *= 0.9999;
      // float ff = smoothstep(0.999, 1., depth.z);
       float step = step(0.999, shadowValue);
       float mm = max(step, (1.-vShadowPosition.x));
       return mm;
       return mm + -vShadowPosition.y;
       //return (vTextureCoord.x * .3) * mm;
       //return  * mm;

       return smoothstep(mm - 0.05, mm + 0.05, 0.5);
       //if(shadowValue < depth.z) { return 0.0 + (1.-vShadowPosition.x); }
       //return ff;
       //if(shadowValue < depth.z) { return (1.-vTextureCoord.x) * .2 + (1.-vShadowPosition.x); }
       //if(shadowValue < depth.z) { return 0.0 + (1.-vShadowPosition.x); }
       return 1.0;
    }
`
export { spotVert, spotFrag }

export default class SpotLight extends alfrid.FrameBuffer {
    constructor(w, h, params) {
        super(w, h, params)

        this._position = vec3.fromValues(4, 2, 4);
        this._target = vec3.fromValues(0, 0, 0);
        this._direction = vec3.create();
        this._viewMat = mat4.create();
        this._upVec = vec3.fromValues(0, 0, 1);
        this._projectionMat = mat4.create();
        this._dirty = true;

        this._cameraViewMat = mat4.create();
        this._cameraProjMat = mat4.create();

        this.color = vec3.fromValues(1.0, 1.0, 1.0);
        this.brightness = 0.;
        this._scaledColor = vec3.create();
        this.radius = 100.0;
        this.innerAngle = Math.PI * 0.1;
        this.outerAngle = Math.PI * 0.15;

        this.bound = false
    }

    set camera(camera) {
        this._camera = camera
    }

    set position(vals) {
        let _diff = vec3.fromValues(...vals)
        //vec3.subtract(_diff, this._position, this._position)
        //vec3.mul(_diff,_diff,vec3.fromValues(0.5,0.5,0.5))
        vec3.set(this._position, ...vals)
        //vec3.copy(this._position, _diff)
    }

    get position() {
        return this._position
    }

    set target(vals) {
        vec3.set(this._target, ...vals)
    }

    get target() {
        return this._target
    }

    get dotProduct(){
      return vec3.dot(this._target, this._position)
    }

    bind() {
        super.bind()
        let gl = GL.gl
        GL.gl.colorMask(false, false, false, false); // Don't write to the color channels at all
        GL.gl.clear(gl.DEPTH_BUFFER_BIT); // Clear only the depth buffer
        if (this._camera) {
            mat4.copy(this._cameraViewMat, this._camera.matrix)
            mat4.copy(this._cameraProjMat, this._camera.projection)

            mat4.copy(this._camera.matrix, this._getViewMat())
            mat4.copy(this._camera.projection, this._getProjectionMat())
        }
        this.bound = true
    }

    unbind() {
        super.unbind()
        GL.gl.colorMask(true, true, true, true);
        if (this._camera) {
            mat4.copy(this._camera.matrix, this._cameraViewMat)
            mat4.copy(this._camera.projection, this._cameraProjMat)
        }
        this.bound = false
    }

    bindUniforms(shader, textureUnit = 1) {
        vec3.subtract(this._direction, this._target, this._position);
        vec3.scale(this._scaledColor, this.color, this.brightness);

        shader.uniform('lightPosition', "vec3", this._position);
        shader.uniform('lightColor', "vec3", this._scaledColor);
        shader.uniform('lightSpotDirection', "vec3", this._direction);

        shader.uniform('lightRadius', "float", this.radius);
        shader.uniform('lightSpotInnerAngle', "float", Math.cos(this.innerAngle));
        shader.uniform('lightSpotOuterAngle', "float", Math.cos(this.outerAngle));

        shader.uniform('lightViewMat', "mat4", this._getViewMat());
        shader.uniform('lightProjectionMat', "mat4", this._getProjectionMat());

        shader.uniform("shadowMap", "uniform1i", textureUnit);
        this.getDepthTexture().bind(textureUnit)
    }

    _getProjectionMat() {
        if(!this._camera){
          return this._projectionMat
        }
        var angle = this.outerAngle * (180 / Math.PI) * 2.0;
        mat4.perspective(this._projectionMat,
            this._camera._fov,
            this._camera._aspectRatio,
            0.1,
            128);
        return this._projectionMat;
    }

    _getViewMat() {
        mat4.lookAt(this._viewMat, this._position, this._target, this._upVec);
        return this._viewMat;
    }
}
