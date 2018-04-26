// IntroScene.js

import alfrid, { Scene } from '../lib/alfrid';
import { getAsset } from '../rad/Utils'
import FirstPersonControl from '../camera/FirstPersonControl'
import Light from '../rad/Light';

import CameraAnim from '../camera/CameraAnimation'

import ViewMars from './IntroView';
import ViewSpace from './IntroSky';
import ViewOut from './IntroOut';
import SceneBuffer from './SceneFbo';
import * as glm from 'gl-matrix';
import _ from 'lodash';

import Emitter from '../rad/Emitter'

const FBO_W = 1920
const FBO_H = 1080
const TAO = Math.PI * 2

const GL = alfrid.GL;
class IntroScene extends alfrid.Scene {
  constructor(sceneData) {
    super();
    GL.enableAlphaBlending();
    this.orbitalControl = new FirstPersonControl(this.camera, window, 100)
    this.orbitalControl.lock(true)

    this.anim = new CameraAnim(this.orbitalControl, {})

    this._initLights()

    //gui.add(this, 'zoomIn')

    this._sceneTimeline = new TimelineMax({
      paused: true,
      onComplete: this._sceneComplete.bind(this)
    })
    this._scenes = sceneData.scenes
    this._sceneIndex = 0
    this._playScene()

    //this._startAnimation(sceneData.animation)
  }

  _initTextures() {
    this._textureDiffuse = new alfrid.GLTexture(getAsset('diffuse'));
    this._textureHeight = new alfrid.GLTexture(getAsset('height'));
    this._textureAo = new alfrid.GLTexture(getAsset('ao'));
    //this._textureAlbedo = new alfrid.GLTexture(getAsset('albedo'));

    this._textureSpace = new alfrid.GLTexture(getAsset('space'));
    this._textureNebula = new alfrid.GLTexture(getAsset('nebula'));

    /*let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'))
    let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'))
    let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'))
    let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'))
    let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'))
    let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'))
    this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);*/
  }

  _initLights() {
    this._sun = new Light({ position: [-30., 10, 0.] })
  }

  _initViews() {
    this.meshes = []
    this._mars = new ViewMars()
    this._mars.rotate(Math.random() * 0.5)
    this._sky = new ViewSpace()
    this._out = new ViewOut()

    this._fbo = new SceneBuffer(FBO_W, FBO_H)
    this._nextSceneFbo = new SceneBuffer(FBO_W, FBO_H)
  }

  _playScene() {
    let _scene = this._scenes[this._sceneIndex]
    this._mars.updateUniforms(_scene.marsUniforms)
    this.anim.positionTransfer = _scene.camera.position

    setTimeout(() => {
      this._transitionScene(_scene)
    }, _scene.duration * 1000)

    this._sceneAnimations(this._scenes[this._sceneIndex])

    // this._sceneTimeline.kill()
    // this._sceneTimeline.clear()
    // let _anims = this._scenes[this._sceneIndex].animations
    // _.forIn(_anims, (val, key) => {
    //     let _p = Object.assign({}, val.props, {
    //         onComplete: () => { this._sceneComplete() }
    //     })
    //     this.anim[key](val.value, _p)
    //         //this._sceneTimeline.add(TweenMax.to(...this.anim[key](val.value, val.props)))
    // })

    //this._sceneTimeline.play()
  }

  _transitionScene(currentScene) {
    let _nextScene = this._scenes[this._sceneIndex + 1]
    this._isTransition = true
    if (_nextScene) {

      if (_nextScene.shake) {
      this.startShake()
    } else {
      this.stopShake()
    }

      let _o = { val: 0 }
      TweenMax.to(_o, currentScene.transitionDuration, {
        val: 1,
        ease: Linear.none,
        onUpdate: () => {
          this._out.transition = _o.val
        },
        onComplete: () => {
          this._isTransition = false
          this._sceneComplete(_nextScene)
        }
      })

      let _marsUniforms = _.clone(currentScene.marsUniforms)
      this._animateUniforms(_marsUniforms,
        currentScene.transitionDuration,
        _nextScene.marsUniforms,
        this._mars)

      let _outUniforms = _.clone(currentScene.outUniforms)
      this._animateUniforms(_outUniforms,
        currentScene.transitionDuration,
        _nextScene.outUniforms,
        this._out)
    }else{
      this._sceneIndex=0
      this._out.transition = 0
      this.stopShake()
      this._playScene()
      //this._playScene()
      console.log("DONE");
      //NO NEXT SCENE
    }
  }

  _animateUniforms(source, time, targetValues, targetView) {
    let _props = Object.assign({},
      targetValues, {
        ease: Linear.none,
        onUpdate: () => {
          targetView.updateUniforms(source)
        }
      })
    TweenMax.to(source,
      time,
      _props
    )
  }

  _sceneComplete(currentScene) {
    this._sceneIndex++
      this._out.transition = 0
    if (this._sceneIndex < this._scenes.length) {
      this._playScene()
    }
  }

  _sceneAnimations(scene) {
    if (scene.animations) {
      _.forIn(scene.animations, (val, key) => {
        if (this.anim[key]) {
          this.anim[key](val.value, Object.assign({},
            val.props, {
              ease: Cubic.easeIn,
            }))
        }
      })

      let _outUniforms = scene.animations.outUniforms
      this._animateUniforms({ atmosphereIntensity: 1 },
        2,
        _outUniforms,
        this._out)
    }
  }

  _renderScene(fbo, index) {
    let _s = this._scenes[index]
    this.camera.reset()
    fbo.clear()
    fbo.bind()
    let _anims = _s.camera
    this.anim.positionTransfer = _anims.position
    let _c = this.anim.positionTransfer
    if (this._isShaking) {
      _c = this._addShake(_c, _s.shakeIntensity)
    }
    this.camera.reset()
    this.anim.setCamera(_c)
    GL.disable(GL.CULL_FACE);
    this._sun.bind()
    this._renderSky()
    this._renderMars();
    GL.enable(GL.CULL_FACE);
    this._sun.unbind()
    fbo.unbind()
  }

  _hasNextScene() {
    return this._sceneIndex < this._scenes.length
  }

  _rotateAround() {
    this.orbitalControl.ry.value += 0.01
  }

  _renderMars() {
    this._mars.render(
      this._textureDiffuse,
      this._textureHeight,
      this._textureAo,
      this._fbo.getTexture()
    );
  }

  _renderSky() {
    this._sky.render(this._textureSpace, this._textureNebula)
  }


  render() {
    if(this._stopRender){
        return
    }
    GL.clear(0, 0, 0, 0);
    this._mars.rotate(0.00005)
      //this._rotateAround()
    this._renderScene(this._fbo, this._sceneIndex)
    if (this._sceneIndex < this._scenes.length - 1 && this._isTransition) {
      this._renderScene(this._nextSceneFbo, this._sceneIndex + 1)
    } else {
      this._nextSceneFbo.clear()
    }
    this.anim.setCamera([0, 0, 0])
    this.cameraOrtho.setBoundary(-1, 1, -1, 1);
    GL.camera._projection = this.cameraOrtho.projection
    this._out.render(
        this._fbo.getTexture(),
        this._nextSceneFbo.getTexture()
      )
      //this._renderCurrent()
      //this._nextSceneFbo.getTexture())
      // //this._rotateAround()
      // GL.disable(GL.CULL_FACE);
      // this._sun.bind()
      // this._renderSky()
      // this._renderMars();
      // GL.enable(GL.CULL_FACE);
      // this._sun.unbind()
  }

  startShake() {
    this._isShaking = true
  }

  stopShake() {
    this._isShaking = false
  }

  _addShake(c, i) {
    let _r = Math.random(TAO)
    return [c[0] + Math.cos(_r) * i,
      c[1] + Math.sin(_r) * i,
      c[2]
    ]
  }

  //gui
  zoomIn() {
    this.animate()
  }

  animate() {
    this.anim.moveTo([30, 10, -60], {
        duration: 4,
        ease: Power1.easeIn,
        onComplete: () => {
          Emitter.emit('intro:complete')
        }
      })
      //this.anim.rotate(-Math.PI, {duration:4})
  }

  set pause(p) {
    this._stopRender = p
  }


  resize() {
    GL.setSize(window.innerWidth, window.innerHeight);
    // this._fbo.width = window.innerWidth
    // this._fbo.height = window.innerHeight
    // this._nextSceneFbo.width = window.innerWidth
    // this._nextSceneFbo.height = window.innerHeight
    this.camera.setAspectRatio(GL.aspectRatio);
  }

  destroy() {
    this.stop()
    this.stopShake()
    this.anim.destroy()
    GL.gl.deleteTexture(this._textureDiffuse.texture)
    GL.gl.deleteTexture(this._textureHeight.texture)
    GL.gl.deleteTexture(this._textureAo.texture)
    GL.gl.deleteTexture(this._textureSpace.texture)
    GL.gl.deleteTexture(this._textureNebula.texture)
    this._fbo.destroy()
    this._nextSceneFbo.destroy()
  }
}


export default IntroScene;
