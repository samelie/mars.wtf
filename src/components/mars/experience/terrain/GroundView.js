// GroundView.js

import alfrid from '../lib/alfrid';
import lodash from 'lodash';
import TweenLite from 'gsap';
import MovementManager from '../MovementManager';
import TerrainPainter from './TerrainPainter';
import { getAsset } from '../rad/Utils'
import Emitter from '../rad/Emitter'
import { MARS_COLORS } from '../SceneData'
let GL = alfrid.GL;

import vs from "./ground_vert"
import fs from "./ground_frag"

//import NOISE from './tools/noise';
const PARAMS = {
  offset: 0
}
const AMP = 30
const W = 256
const H = 256
const SEG = 128
const scale = 5


class GroundView extends alfrid.View {

  constructor(params = {}) {
    super(vs, fs);
    this._texures = []
    this._texuresLength = 0
    this.baseColor = MARS_COLORS.baseColor
    this.rotation = params.mesh.rotation || Math.PI / 2
    this.scale = params.mesh.scale || scale
    this._wsegments = params.mesh.widthSegments || SEG
    this._hsegments = params.mesh.heightSegments || SEG
    this._w = params.mesh.width || W
    this._h = params.mesh.height || H
    this._amp = params.mesh.amp || AMP
    this.x = 0
    this.y = 0
    this.z = 0
    this._washOutFactor = 0
    this._wasOutTween = {}
    this._initMesh()
    this._initPosition(params.mesh.position || [0, -4, 0])

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

    this._scales = [this.scale, this.scale, this.scale]
    this._position = [this.x, this.y, this.z]

    //this._createCanvas()

    this._terrainHeight = new TerrainPainter(Object.assign({}, params.movement, { verbose: false }))
    this._terrainHeight.setTerrains(params.mesh.heightmaps)
    this._terrainAo = new TerrainPainter(Object.assign({}, params.movement, { verbose: false }))
    this._terrainAo.setTerrains(params.mesh.textures)

    this._heightTexture = new alfrid.GLTexture(this._terrainHeight.canvas);
    this._aoTexture = new alfrid.GLTexture(this._terrainAo.canvas);
    //this._updateMap()

    Emitter.on('movement:complete', () => {
      this._terrainHeight.next()
      this._terrainAo.next()
      this._sideViews[0].next()
      this._sideViews[1].next()
      this.blendSides(this._sideViews)
      this._heightTexture.updateTexture(this._terrainHeight.canvas)
      this._aoTexture.updateTexture(this._terrainAo.canvas)
    })
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
      overwrite:1,
      onUpdate: () => {
        this._washOutFactor =this._wasOutTween.val
      }
    })
  }

  exitProductMode() {

  }

  /*_createCanvas() {
      this._canvas = document.createElement('canvas')
      this._ctx = this._canvas.getContext('2d')
      this._canvas.width = W
      this._canvas.height = H
  }

  _drawAsset(id) {
      var _c = document.createElement('canvas')
      this._ctx = _c.getContext('2d')
      _c.width = this._w
      _c.height = this._h
      this._ctx.drawImage(getAsset(id), 0, 0);
  }*/

  createFromAssetId(id) {
    //this._drawMapData(MovementManager.getMap())
    //this._drawAsset(id)
  }

  pixelValueAt(x, y) {
    return this._terrainHeight.getPixelValueAt(x, y) * this._amp
      /* x = Math.round(x) + this._w / 2
       y = Math.round(y) + this._h / 2
       var imgd = this._ctx.getImageData(x, y, 1, 1);
       var pix = imgd.data;
       return pix[0] / 255 * this._amp*/
  }

  blendSides(sideViews) {
    let _leftSides = sideViews[0].getSides(true)
    let _rightSides = sideViews[1].getSides(false)
      //height left
    this._terrainHeight.blendSide(_leftSides[0], true)
      //height right
    this._terrainHeight.blendSide(_rightSides[0], false)
      //ao left
    this._terrainAo.blendSide(_leftSides[1], true)
      //ao right
    this._terrainAo.blendSide(_rightSides[1], false)
    this._heightTexture.updateTexture(this._terrainHeight.canvas)
    this._aoTexture.updateTexture(this._terrainAo.canvas)
  }

  set spotlight(spotlight) {
    this._spotlight = spotlight
  }

  set sun(sun) {
    this._sun = sun
  }

  set sideViews(sideViews) {
    this._sideViews = sideViews
    this.blendSides(this._sideViews)
  }

  _init() {

  }

  _initMesh() {
    this.mesh = alfrid.Geom.plane(this._w, this._h, this._wsegments, this._hsegments);
  }


  render(renderShadow = false) {
    //console.log(this.z);
    //this._terrainHeight.update()
    //this._terrainAo.update()
    this._position[2] = MovementManager.z
      //this._updateMap()
    this.shader.bind();
    if (MovementManager.needsUpdate) {
      // this._heightTexture.updateTexture(this._terrainHeight.canvas)
      //this._aoTexture.updateTexture(this._terrainAo.canvas)
    }
    this.shader.uniform("uAoMap", "uniform1i", 0);
    this.shader.uniform("uHeightMap", "uniform1i", 1);
    this._aoTexture.bind(0);
    this._heightTexture.bind(1);
    // if (this._terrainHeight.needsUpdate) {
    // }
    // if (this._terrainAo.needsUpdate) {
    // }

    if (renderShadow) {
      this._spotlight.bindUniforms(this.shader, 2)
      this.shader.uniform("sunPosition", "vec3", this._spotlight.position);
    }

    this.shader.uniform("baseColor", "vec3", this._pBase);
    this.shader.uniform("lightColor", "vec3", this._pLight);
    this.shader.uniform("darkColor", "vec3", this._pDark);
    this.shader.uniform("fogColor", "vec3", this._pFog);
    this.shader.uniform("position", "vec3", this._position);
    this.shader.uniform("scale", "vec3", this._scales);
    this.shader.uniform("rotation", "float", this.rotation);
    this.shader.uniform("heightMap", "float", this._amp);
    this.shader.uniform("washOutFactor", "float", this._washOutFactor);
    this.shader.uniform("uAngle", "float", this._sun.angle);
    GL.draw(this.mesh);
  }


}

export default GroundView;
