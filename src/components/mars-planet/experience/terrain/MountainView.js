// MountainView.js

import alfrid from '../lib/alfrid';
import lodash from 'lodash';
import { getAsset } from '../rad/Utils'
import { MARS_COLORS } from '../SceneData'
let GL = alfrid.GL;

import vs from "./mountain_vert"
import fs from "./mountain_frag"

//import NOISE from './tools/noise';
const PARAMS = {
    offset: 0
}
const AMP = 140
const W = 512
const H = 256
const SEG = 32
const scale = 3

const TIME = 0.001

class MountainView extends alfrid.View {

    constructor(params = {}) {
        super(vs, fs);
        this._params = params
        this._texures = []
        this._texuresLength = 0
        this.baseColor = MARS_COLORS.baseColor
        this.rotationX = Math.PI / 2
        this.rotationY = Math.PI / 2
        this.scale = params.scale || scale
        this._wsegments = params.widthSegments || SEG
        this._hsegments = params.heightSegments || SEG
        this._w = params.width || W
        this._h = params.height || H
        this._amp = params.amp || AMP
        this.x = 0
        this.y = 0
        this.z = 0
        this._initMesh()
        this._initPosition(params.position || [0, 0, 0])

        this._pDark = [
            MARS_COLORS.darkColor[0] / 255,
            MARS_COLORS.darkColor[1] / 255,
            MARS_COLORS.darkColor[2] / 255
        ]
        this._pBase = [
            MARS_COLORS.baseColor[0] / 255,
            MARS_COLORS.baseColor[1] / 255,
            MARS_COLORS.baseColor[2] / 255
        ]
        this._pLight = [
            MARS_COLORS.lightColor[0] / 255,
            MARS_COLORS.lightColor[1] / 255,
            MARS_COLORS.lightColor[2] / 255
        ]

        this._pFog = [
            MARS_COLORS.fogColor[0] / 255,
            MARS_COLORS.fogColor[1] / 255,
            MARS_COLORS.fogColor[2] / 255
        ]

        this._c = 0
    }

    _initPosition(pos) {
        this.x = pos[0]
        this.y = pos[1]
        this.z = pos[2]
    }

    _init() {}

    _initMesh() {
        this.mesh = alfrid.Geom.plane(this._w, this._h, this._wsegments, this._hsegments);

        this._tW = new alfrid.GLTexture(getAsset(this._params.heightmaps[0]));
        this._tWao = new alfrid.GLTexture(getAsset(this._params.textures[0]));
    }


    render() {
        this._c+= TIME
        this.shader.bind();
        this.shader.uniform("uHeightMap", "uniform1i", 0);
        this.shader.uniform("uAoMap", "uniform1i", 1);
        this._tW.bind(0);
        this._tWao.bind(1);
        this.shader.uniform("heightMap", "float", this._amp);
        this.shader.uniform("rotationY", "float", this.rotationY);
        this.shader.uniform("rotationX", "float", this.rotationX);
        this.shader.uniform("baseColor", "vec3", this._pBase);
        this.shader.uniform("lightColor", "vec3", this._pLight);
        this.shader.uniform("darkColor", "vec3", this._pDark);
        this.shader.uniform("position", "vec3", [this.x, this.y, this.z]);
        this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
        this.shader.uniform("time", "float", this._c);
        GL.draw(this.mesh);
    }


}

export default MountainView;
