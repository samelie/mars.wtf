// ViewEnv.js

import alfrid, { Mesh } from '../lib/alfrid';
import _ from 'lodash'
let GL = alfrid.GL;

import vs from "./shaders/planet_vert"
import fs from "./shaders/planet_frag"

const PARAMS = {
    gamma: 0.8,
    displace: 1.6,
    exposure: 3.,
    baseColor: [1, 0.765557, 0.336057],
    baseColorAmount: 1,
    diffuseColorAmount: 0,
    saturation: 1.0,
    ao: 0.2,
    metallic: 0,
    roughness: 1,
    specular: 0,
    offset: 0,
    fov: 45,
    visible: true
};

class IntroView extends alfrid.View {

    constructor() {
        super(vs, fs);

        let f = gui.addFolder('render settings');
        f.addColor(PARAMS, 'baseColor');
        f.add(PARAMS, 'roughness', 0, 1);
        f.add(PARAMS, 'baseColorAmount', 0, 1);
        f.add(PARAMS, 'diffuseColorAmount', 0, 1);
        f.add(PARAMS, 'displace', 0, 40);
        f.add(PARAMS, 'specular', 0, 1);
        f.add(PARAMS, 'metallic', 0, 1);
        f.add(PARAMS, 'saturation', 0, 1.);
        f.add(PARAMS, 'ao', 0, .5);
        f.add(PARAMS, 'gamma', 1, 10);
        f.add(PARAMS, 'exposure', 1, 40);
        f.add(PARAMS, 'offset', 0, 1);

        this.x = 0.
        this.y = 0.
        this.z = 0.
        this.scale = 1
        this.rotation = 0

        this._time = 0

        this.atmosphereIntensity = 0.4
        this.fresnelBias = 0.05
        this.fresnelAmp = 1.
    }

    set position(p)    {
        this.x = p[0]
        this.y = p[1]
        this.z = p[2]
    }


    _init() {
        this.mesh = alfrid.Geom.sphere(30, 116, true, true);
    }

    rotate(incr){
        this.rotation += incr
    }

    updateUniforms(uni){
        _.forIn(uni, (val, key)=>{
            this[key] = val
        })
    }

    render(texture, textureHeight, textureAo, nextScene, textureIrr) {
        this._time++;
        this.shader.bind();
        this.shader.uniform("uDiffuse", "uniform1i", 0);
        this.shader.uniform("textureHeight", "uniform1i", 1);
        this.shader.uniform("uAoMap", "uniform1i", 2);
        this.shader.uniform("nextScene", "uniform1i", 3);
        //this.shader.uniform("uIrradianceMap", "uniform1i", 4);

        // this.shader.uniform("uAoStrength", "uniform1f", PARAMS.ao);
        // this.shader.uniform("uExposure", "uniform1f", PARAMS.exposure);
        // this.shader.uniform("displace", "float", PARAMS.displace);
        // this.shader.uniform("uSaturation", "float", PARAMS.saturation);
        // this.shader.uniform("uGamma", "uniform1f", PARAMS.gamma);

        let roughness = PARAMS.roughness * 0.925;
        let roughness4 = Math.pow(roughness, 4.0);
        let baseColor = [PARAMS.baseColor[0], PARAMS.baseColor[1], PARAMS.baseColor[2]];
        this.shader.uniform("uBaseColor", "uniform3fv", baseColor);
        this.shader.uniform("uRoughness", "uniform1f", roughness);
        this.shader.uniform("uRoughness4", "uniform1f", roughness4);
        this.shader.uniform("uMetallic", "uniform1f", PARAMS.metallic);
        this.shader.uniform("uSpecular", "uniform1f", PARAMS.specular);

        texture.bind(0);
        textureHeight.bind(1);
        textureAo.bind(2);
        //textureAlbedo.bind(3);
        nextScene.bind(3);
        //textureIrr.bind(4);

        let offset = 1.0 - PARAMS.offset;

        this.shader.uniform("position", "vec3", [this.x * offset, this.y * offset - PARAMS.offset * 7.5, this.z * offset]);
        this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
        this.shader.uniform("rotation", "float", this.rotation);
        this.shader.uniform("displace", "float", PARAMS.displace);
        //this.shader.uniform("uLightIntensity", "float", PARAMS.lightIntensity);

        this.shader.uniform("baseColorAmount", "float", PARAMS.baseColorAmount);
        this.shader.uniform("diffuseColorAmount", "float", PARAMS.diffuseColorAmount);

        this.shader.uniform("uExposure", "uniform1f", PARAMS.exposure);
        this.shader.uniform("uGamma", "uniform1f", PARAMS.gamma);
        this.shader.uniform("uAoStrength", "uniform1f", PARAMS.ao);
        this.shader.uniform("uGreenOffset", "float", offset);

        this.shader.uniform("uTime", "float", this._time);
        this.shader.uniform("atmosphereIntensity", "float", this.atmosphereIntensity);
        this.shader.uniform("fresnelBias", "float", this.fresnelBias);
        this.shader.uniform("fresnelAmp", "float", this.fresnelAmp);
        GL.draw(this.mesh);
    }


}

export default IntroView;