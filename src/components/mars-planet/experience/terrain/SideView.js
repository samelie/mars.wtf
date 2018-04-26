// SideView.js

import alfrid from '../lib/alfrid';
import lodash from 'lodash';
import MovementManager from '../MovementManager';
import TerrainPainter from './TerrainPainter';
import { getAsset } from '../rad/Utils'
import Emitter from '../rad/Emitter'
import { MARS_COLORS } from '../SceneData'
let GL = alfrid.GL;

import vs from "./mountain_vert"
import fs from "./mountain_frag"

//import NOISE from './tools/noise';
const PARAMS = {
  offset: 0
}
const AMP = 30
const W = 256
const H = 256
const SEG = 128
const scale = 5
const TIME = 0.001

class SideView extends alfrid.View {

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
    this._washOutFactor = 0
    this._wasOutTween = {}
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
    this._scales = [this.scale, this.scale, this.scale]
    this._position = [this.x, this.y, this.z]
    console.log(this._position);
    this._terrainHeight = new TerrainPainter(Object.assign({}, params.movement, { verbose: params.movement.verboseHeight }))
    this._terrainAo = new TerrainPainter(Object.assign({}, params.movement, { verbose: params.movement.verboseAo }))
    this._terrainHeight.setTerrains(params.heightmaps)
    this._terrainAo.setTerrains(params.textures)

    this._heightTexture = new alfrid.GLTexture(this._terrainHeight.canvas);
    this._aoTexture = new alfrid.GLTexture(this._terrainAo.canvas);

  }

  _initPosition(pos) {
    this.x = pos[0]
    this.y = pos[1]
    this.z = pos[2]
  }

  enterProductMode(dur) {
    this._wasOutTween.val = this._washOutFactor
    TweenLite.to(this._wasOutTween, dur, {
      val: 1,
      overwrite: 1,
      onUpdate: () => {
        this._washOutFactor = this._wasOutTween.val
      }
    })
  }

  exitProductMode() {

  }

  _init() {}

  _initMesh() {
    this.mesh = alfrid.Geom.plane(this._w, this._h, this._wsegments, this._hsegments);
  }

  set sun(sun) {
    this._sun = sun
  }

  getSides(left) {
    return [
      this._terrainHeight.getSide(left),
      this._terrainAo.getSide(left)
    ]
  }

  next() {
    this._terrainHeight.next()
    this._terrainAo.next()
    this._heightTexture.updateTexture(this._terrainHeight.canvas)
    this._aoTexture.updateTexture(this._terrainAo.canvas)
  }

  render(renderShadow = false) {
    this._c += TIME
    this._position[2] = MovementManager.z
    this.shader.bind();
    this.shader.uniform("uHeightMap", "uniform1i", 0);
    this.shader.uniform("uAoMap", "uniform1i", 1);
    this._heightTexture.bind(0);
    this._aoTexture.bind(1);
    this.shader.uniform("position", "vec3", this._position);
    this.shader.uniform("scale", "vec3", this._scales);

    this.shader.uniform("baseColor", "vec3", this._pBase);
    this.shader.uniform("lightColor", "vec3", this._pLight);
    this.shader.uniform("darkColor", "vec3", this._pDark);
    this.shader.uniform("fogColor", "vec3", this._pFog);
    this.shader.uniform("washOutFactor", "float", this._washOutFactor);
    this.shader.uniform("rotationX", "float", this.rotationX);
    this.shader.uniform("heightMap", "float", this._amp);
    this.shader.uniform("uAngle", "float", this._sun.angle);
    GL.draw(this.mesh);
  }


}

export default SideView;
