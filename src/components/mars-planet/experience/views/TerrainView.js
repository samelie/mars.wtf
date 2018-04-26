// TerrainView.js

import alfrid from '../lib/alfrid';
import lodash from 'lodash';
import { getAsset } from '../rad/Utils'
let GL = alfrid.GL;
import ViewBase from './ViewBase'

import vs from "./ground_vert"
import fs from "./ground_frag"

//import NOISE from './tools/noise';
const PARAMS = {
    offset: 0
}
const AMP = 30
const W = 512
const H = 512
const SEG = 128

class TerrainView extends ViewBase {

    constructor(params = {}) {
        super(vs, fs);
        this._texures=[]
        this._texuresLength = 0
        this.rotation = Math.PI / 2
        this.scale = params.scale || 1
        this._segments = params.segments || SEG
        this._w = params.width || W
        this._h = params.height || H
        this._amp = params.amp || AMP
        this.x = 0
        this.y = 0
        this.z = 0
        this._initMesh()
        this._initPosition(params.position)
    }

    _initPosition(pos){
        this.x = pos[0]
        this.y = pos[1]
        this.z = pos[2]
    }

    _drawAsset(id) {
        var _c = document.createElement('canvas')
        this._ctx = _c.getContext('2d')
        _c.width = this._w
        _c.height = this._h
        this._ctx.drawImage(getAsset(id), 0, 0);
    }

    createFromAssetId(id) {
        this._drawAsset(id)
        this._heightTexture = new alfrid.GLTexture(getAsset(id));
    }

    pixelValueAt(x, y) {
        x = Math.round(x) + this._w / 2
        y = Math.round(y) + this._h / 2
        var imgd = this._ctx.getImageData(x, y, 1, 1);
        var pix = imgd.data;
        return pix[0] / 255 * this._amp
    }

    _init() {
    }

    _initMesh(){
        console.log(this._w, this._h);
        this.mesh = alfrid.Geom.plane(this._w, this._h, this._segments, true);
    }


    render() {
        this.shader.bind();
        this.shader.uniform("uAoMap", "uniform1i", 0);
        this._bindModelTextures()
        this.shader.uniform("uHeightMap", "uniform1i", 1);
        this._heightTexture.bind(1);

        this.shader.uniform("position", "vec3", [this.x , this.y , this.z ]);
        this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
        this.shader.uniform("rotation", "float", this.rotation);
        this.shader.uniform("heightMap", "float", this._amp);
        GL.draw(this.mesh);
    }


}

export default TerrainView;
