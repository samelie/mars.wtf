// ViewAlys.js

import alfrid, { Mesh } from '../lib/alfrid';
let GL = alfrid.GL;
import ViewBase from './ViewBase'
import vs from "./models_vert"
import fs from "./models_frag"
import * as glm from 'gl-matrix';
import _ from 'lodash';
import { getAsset } from '../rad/Utils'

const PARAMS = {
    gamma: 1,
    displace: 1.6,
    exposure: 2.8,
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

class ViewAlys extends ViewBase {

    constructor(data, x = 0, y = 0, z = 0, scale = 4, params = {}) {

        super(vs, fs);

        this.data = data

        this.x = x
        this.y = y
        this.z = z
        this.scale = scale

        this.rotation = params.rotation || 0 ;//Math.random() * Math.PI;
        this._heightValue = 0
        this._positionBase = [this.x, this.y, this.z]
        this._position = [this.x, this.y, this.z]
        this._positionOffset = [0,0,0]

        /*this._position = glm.vec3.fromValues(this.x,this.y,this.z)
        this._positionOffset = glm.vec3.fromValues(0,0,0)

        this._worldPosition = glm.vec3.create()
        glm.vec3.add(this._worldPosition, this._position, this._positionOffset)

        this._positionNormalized = glm.vec3.create()
        glm.vec3.normalize(this._positionNormalized, this._position)*/

        this._texures=[]
        this._texuresLength = 0

        this.isLow = true
        this.meshes = {
            low: data.url,
            high: data.high
        }

        Object.keys(params, (key) => {
            this[key] = params[key]
        })

        this._hotspotIndex = 0

        this._loadMeshes()
    }

    _loadMeshes(){
        this.mesh;
        this.isReady = false;
		    this.isLow = true
        let _mPath = this.meshes[this._getMode()]
        this._objLoader = new alfrid.ObjLoader();
        this._objLoader.load(process.env.REMOTE_ASSETS_DIR+_mPath, (mesh) => this._onObjLoaded(mesh), false);
    }

    _getMode() {
        return this.isLow ? 'low' : 'high'
    }

    _getPath() {
        return OBJS[this._getMode()]
    }

    _onObjLoaded(mesh) {
        this.mesh = mesh;
        this.isReady = true;
        const r = 40;
        if (this.isLow) {
            this.meshes.low = mesh
        } else {
            this.meshes.high = mesh
        }

        /*/
        let f = gui.addFolder('model');
        f.add(this, 'x', -r, r).step(0.01).onFinishChange(()=>this._log());
        f.add(this, 'y', -r, r).step(0.01).onFinishChange(()=>this._log());
        f.add(this, 'z', -r, r).step(0.01).onFinishChange(()=>this._log());
        f.add(this, 'scale', 0, 10).onFinishChange(()=>this._log());
        f.add(this, 'rotation', 0, Math.PI * 2.0).onFinishChange(()=>this._log());

        f.open();
        //*/
    }

    toggleMesh() {
        this.isLow = !this.isLow
        let _mPath = this._getPath()
        if (this.isLow) {
            if (this.meshes.low) {
                this.mesh = this.meshes.low
            } else {
                this._objLoader.load(`${process.env.REMOTE_ASSETS_DIR}${_mPath}`, (mesh) => {
                    this.meshes.low = mesh
                    this.mesh = this.meshes.low
                }, false);
            }
        } else {
            if (this.meshes.high) {
                this.mesh = this.meshes.high
            } else {
                this._objLoader.load(`${process.env.REMOTE_ASSETS_DIR}${_mPath}`, (mesh) => {
                    this.meshes.high = mesh
                    this.mesh = this.meshes.high
                }, false);
            }
        }
    }

    setHeightValue(v){
        this._heightValue = v
        //this._positionOffset[1] = this._heightValue / 2
    }

    useShadowMap(shadow){
        this._shadow = shadow
    }

    set sun(sun){
        this._sun = sun
    }

    set hotspotIndex(i){
        this._hotspotIndex = i
    }

    get hotspotIndex(){
        return this._hotspotIndex
    }

    get position(){
        return this._position
    }

    get positionBase(){
        return this._positionBase
    }

    _log() {
        console.log('Position:', this.x, this.y, this.z);
        console.log('Scale:', this.scale);
        console.log('Rotation:', this.rotation);
    }

    render(textureRad, textureIrr) {
        if (!this.isReady) {
            return;
        }
        this.shader.bind();
        this.shader.uniform("uDiffuse", "uniform1i", 0);
        if(textureRad){
            this.shader.uniform("shadowMap", "uniform1i", 1);
        }
        //this.shader.uniform("uAoMap", "uniform1i", 1);
        //this.shader.uniform("uRadianceMap", "uniform1i", this._texuresLength);
        //this.shader.uniform("uIrradianceMap", "uniform1i", this._texuresLength+1);
        this._bindModelTextures()

        // if(this._shadow){
        //     if(!this._shadow.bound){
        //         this._shadow.bindUniforms(this.shader, 1)
        //     }
        // }
        if(textureRad){
            textureRad.bind(1);
            this.shader.uniform("useDepth", "int", 1);
        }else{
            this.shader.uniform("useDepth", "int", 0);
        }
        //textureIrr.bind(this._texuresLength+1);

        let roughness = PARAMS.roughness * 0.925;
        let roughness4 = Math.pow(roughness, 4.0);
        let baseColor = [PARAMS.baseColor[0] , PARAMS.baseColor[1] , PARAMS.baseColor[2] ];
        this.shader.uniform("uBaseColor", "uniform3fv", baseColor);
        this.shader.uniform("uRoughness", "uniform1f", roughness);
        this.shader.uniform("uRoughness4", "uniform1f", roughness4);
        this.shader.uniform("uMetallic", "uniform1f", PARAMS.metallic);
        this.shader.uniform("uSpecular", "uniform1f", PARAMS.specular);

        let offset = 1.0 - PARAMS.offset;
        this.shader.uniform("position", "vec3", this._position);
        this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
        this.shader.uniform("rotation", "float", this.rotation);
        this.shader.uniform("heightMap", "float", this._heightValue);
        this.shader.uniform("uAngle", "float", this._sun.angle);
        this.shader.uniform("uLightIntensity", "float", 0.);

        this.shader.uniform("baseColorAmount", "float", PARAMS.baseColorAmount);
        this.shader.uniform("diffuseColorAmount", "float", PARAMS.diffuseColorAmount);

        this.shader.uniform("uExposure", "uniform1f", PARAMS.exposure);
        this.shader.uniform("uGamma", "uniform1f", PARAMS.gamma);
        this.shader.uniform("uAoStrength", "uniform1f", PARAMS.ao);
        this.shader.uniform("uGreenOffset", "float", offset);

        GL.draw(this.mesh);
    }

}

export default ViewAlys;
