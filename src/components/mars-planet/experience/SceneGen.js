// SceneGen.js

import { getAsset, FrameBuffer } from './rad/Utils'
import alfrid, { Scene } from './lib/alfrid'
import FirstPersonControl from './camera/FirstPersonControl'
import CameraAnim from './camera/CameraAnimation'
import MovementManager from './MovementManager'

import ViewEnv from './terrain/ViewEnv'
import Sculptures from './Sculptures';

import HDRMap from './HDRMap';

import Light from './rad/Light';
import SpotLight from './rad/SpotLight';
import Emitter from './rad/Emitter'
import GLUtil from './rad/GLUtil'
import RadBuffer from './rad/FrameBuffer'

import KeyBoard from './utils/KeyBoard'

import ViewDepth from './terrain/ViewDepth'
import ViewSun from './terrain/ViewSun'

const GL = alfrid.GL;
class SceneGen extends alfrid.Scene {
  constructor(sceneData) {
    super({ sceneData });
    GL.enableAlphaBlending();
    this._sceneData = sceneData
    this.params = {}
    this.params.sceneData = this._sceneData
    this._initViewss()
    this.orbitalControl = new FirstPersonControl(this.camera, window, 15)
    this.offset = new alfrid.EaseNumber(0, 0.03);

    this.anim = new CameraAnim(this.orbitalControl, {
      radius: 100,
      //y: 4,
    })
    this.anim.init(this._sculptures, sceneData.camera)
      //this.anim.setPositionOffset(sceneData.camera.position)
    this._initLights()
      //this._initTextures()
      //this.anim.lookAtMesh(this._sculptures.activeMesh)
      // this.anim.animate(this._sceneData.camera.animation)

    Emitter.on('nav:mesh:next', () => {
      //this._spotLight.setTarget(this._sculptures.activeMesh.position)
      //this._spotLight.target =this._sculptures.activeMesh.position
      //this._sun.z = this._sculptures.activeMesh.position[2]-4
      this.anim.moveToActive()
    })


    Emitter.on('sculpture:near', (index) => {
      this._allowProductMode = true
    })

    Emitter.on('sculpture:out', (index) => {
      this._allowProductMode = false
    })
    Emitter.on('gui:toggleRender', (index) => {
      this._stopRender = !(!!this._stopRender)
    })

    Emitter.on('keyboard:sculpture:view', (index) => {
        if (this._allowProductMode) {
          MovementManager.pause = true
          this.anim.enterProductMode()
          this._env.enterProductMode()
          Emitter.emit('nav:sculptures:nexthotspot')
        }
      })
      //this.anim.moveToMesh(this._sculptures.activeMesh.position)

    this._elapsed = 0
  }

  _initViewss() {
    let _sd = this.params.sceneData
    let _views = _sd['views']

    let _terrainData = _views.terrain
    let _skyData = _views.sky
      // this._terrain = new TerrainView(_terrain)
      // this._terrain.createTextures(_terrain.textures)
      // this._terrain.createFromAssetId(_terrain.id)

    // this._sky = new SkyView(_sky)
    // this._sky.texture = new alfrid.GLTexture(getAsset(_sky.id));
    MovementManager.setParams(_terrainData.movement)

    this._env = new ViewEnv({
      sky: _skyData,
      ground: _terrainData
    })

    let _sculptures = _views['sculptures']
    this._sculptures = new Sculptures(_sculptures)
    this._sculptures.setHeightData(this._env.terrain)

    this._fbo = new RadBuffer(this.camera, 512)

    this._depth = new ViewDepth()
  }

  _initTextures() {
    return;
    this._textureRad = new HDRMap([
      'rad_posx',
      'rad_negx',
      'rad_posy',
      'rad_negy',
      'rad_posz',
      'rad_negz'
    ])

    this._textureIrr = new HDRMap([
      'irr_posx',
      'irr_negx',
      'irr_posy',
      'irr_negy',
      'irr_posz',
      'irr_negz'
    ])
  }

  _initLights() {
    //this._light = new Light()
    this._spotLight = new SpotLight(512, 512)
    this._spotLight.camera = this.camera
    this._spotLight.target = [0, 0, 0] //this._sculptures.activeMesh.position

    this._env._terrain.spotlight = this._spotLight

    this._sun = new ViewSun(this.orbitalControl)
      //this._sun.z = -40
    this._env.sun = this._sun
    this._sculptures.sun = this._sun

  }

  _drawShadowMap() {
    let _e = this._elapsed / 2000
    this._spotLight.bind();
    this._spotLight.position = this._sun.position
    this._drawScultpures()
    this._spotLight.unbind();
    GL.clear(0, 0, 0, 0)
  }

  _drawEnv(sceneDepth, renderShadows) {
    this._env.render(sceneDepth, renderShadows)
  }

  _drawScultpures(depth) {
    this._sculptures.render()
  }

  _drawScene() {
    //GL.disable(GL.CULL_FACE);
    //this._light.bind()
    this._drawEnv()
      //this._env.render(this._spotLight.depthTexture())
    this._drawScultpures()
      //GL.disable(GL.CULL_FACE);
  }

  _drawToFbo() {
    this._fbo.clear()
    this._fbo.bind(this._sculptures.activeMesh.position);
    this._drawEnv(null, false)
      //this._drawScultpures()
    this._fbo.unbind()
  }

  render() {
    if (!this._stopRender) {

      GL.clear(0, 0, 0, 0);
      GL.setMatrices(this.camera)
      MovementManager.update()
      this._elapsed++
      //********
      //this._drawShadowMap()
      //this._drawToFbo()
      //********
        //this._drawScene(this._fbo.getDepthTexture())
      this._drawScultpures()
        //this._drawScene()
      this._drawEnv(true)
        //this._drawEnv(this._fbo.getDepthTexture(), true)
        //this._drawScultpures()
        //GL.enable(GL.CULL_FACE);
        //this._env.render()
        //this._drawScultpures()

      // GLUtil.drawTexturedQuad(GL.gl,
      //     this._fbo.getTexture().texture,
      //     500 * 0.75,
      //     0,
      //     256,
      //     256);
      // GL.gl.bindTexture(GL.gl.TEXTURE_2D, null);

      this._sun.updateAngle()
        //this._sun.render()

      // this._depth.render(this._spotLight.getDepthTexture())
    }
  }

  set pause(p){
    this._stopRender = p
  }


  resize() {
    GL.setSize(window.innerWidth, window.innerHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}


export default SceneGen;
