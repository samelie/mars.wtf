import GSAP from 'gsap';
import * as glm from 'gl-matrix';
import _ from 'lodash';
import Scheduler from '../lib/alfrid/tools/Scheduler';
import alfrid, { Mesh } from '../lib/alfrid';
let GL = alfrid.GL;

import { getMouse } from '../rad/Utils';

import Emitter from '../rad/Emitter'

const TAO = Math.PI * 2
const EXPLORE_FACTOR_X = 0.4
const EXPLORE_FACTOR_Y = 0.05
const HALF_PI = Math.PI / 2
const PI = Math.PI

export default class CameraAnimation {
  constructor(controls, params = {}) {
    this.controls = controls
    this.rx = this.controls.rx
    this.ry = this.controls.ry
    this.radius = this.controls.radius

    this._mouse = {}
      // this._setParams(params)
    this.controls.rx.limit(0, Math.PI / 2)

    this._baseRadius = this.controls.radius.value
    this._coordTransfer = []

    this._rotateValue = 0
    this._ascendValue = 0

    Emitter.on('set:meshdata', (d) => { this._setMeshData(d) })
    Emitter.on('camera:hotspot', (hotspot) => { this._goToHotspot(hotspot) })

    this.COORDS = {
      x: this.controls.positionOffset[0],
      y: this.controls.positionOffset[1],
      z: this.controls.positionOffset[2],
    }
    this.ROTATE = {
      ry: this.controls.ry.value
    }
    this.RX = {
      rx: this.controls.rx.value
    }
    this._tweenCoordObj = Object.assign({}, this.COORDS)
    this._tweenRotateObj = Object.assign({}, this.ROTATE)
    this._tweenRxObj = Object.assign({}, this.RX)
    this._tweenRadiusObj = { radius: this.controls.radius.value }
      //this._assignPropsToModel(obj.positionOffset, this.COORDS, true)
      //this.move(obj.positionOffset)

    //this.lookAtMesh(this._sculptures.activeMesh)
    //this.controls.setCenter(obj.positionOffset)

    this._preventLooseControls = true
    this._scheduleId = Scheduler.addEF(() => this._loop());
  }

  init(sculptures, options) {
    //this.controls.limit(...options.limit)
    let _start = options.start

    this._sculptures = sculptures
      //console.log(...obj.limit);
    this.controls.rx.value = _start.rx
    this.controls.radius.value = _start.radius || this.controls.radius.value
    this.controls.setCenter(_start.p)
    this.controls.setPositionOffset(_start.p)

    //this.leaveProductMode()
  }

  enterProductMode() {
    this.ry.limit(-PI, PI)
    this._removeCruiseControls()
  }

  leaveProductMode() {
    this.ry.limit(-HALF_PI, HALF_PI)
    this._addCruiseControls()
  }

  /*the initial animation*/
  animate(animation) {
    this.controls.lock(true)
    this._timeline = new TimelineMax({
      paused: true,
      onComplete: this._introAnimationComplete.bind(this)
    })

    let _m = this._sculptures.activeMesh.data.hotspots[0]
    this._goToHotspot(_m)

    this._addExploreControls()
      // animation.forEach(anim => {
      //     let _tween;
      //     switch (anim.type) {
      //         case 'rotate':
      //             _tween = this._getRotate(anim.value, anim.props)
      //             break;
      //         case 'moveToMesh':
      //             _tween = this.getMoveTo(
      //                 this._sculptures.meshBy(anim.id).position,
      //                 anim.props)
      //             break;
      //         case 'radius':
      //             _tween = this._getRadius(anim.value, anim.props)
      //             break;
      //     }
      //     this._timeline.to(..._tween, anim.props.offset)
      //     this._timeline.to(..._tween, anim.props.offset)
      // })

    // this._timeline.play()
  }

  goToNext() {}

  moveToActive() {
    let _current = this._sculptures.activeMesh
      // let _previous = this._sculptures.previousActiveMesh

    // let _dot = this._getDotRotation(
    //     this.controls.getNormalizedPosition(),
    //     _current.normalizedPosition) - _current.rotation
    // this._rotate(_dot)
    this._moveTo(_current.position, {
      y: this._tweenCoordObj.y
    })

    //this._lookAtMesh(_current)
  }


  _introAnimationComplete() {
    //this._addExploreControls()
    let _m = this._sculptures.activeMesh.data.hotspots[0]
    this._goToHotspot(_m)
  }

  _addCruiseControls() {
    window.addEventListener('mousemove', (e) => this._onCruiseMove(e));
    window.addEventListener('touchmove', (e) => this._onCruiseMove(e));
  }

  _removeCruiseControls() {
    window.removeEventListener('mousemove', (e) => this._onCruiseMove(e));
    window.removeEventListener('touchmove', (e) => this._onCruiseMove(e));
  }

  _addExploreControls() {
    this.controls.lock(false)
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('touchmove', (e) => this._onMouseMove(e));
    window.addEventListener('mousedown', (e) => this._onDown(e));
    window.addEventListener('touchstart', (e) => this._onDown(e));
    window.addEventListener('touchend', () => this._onUp());
    window.addEventListener('mouseup', () => this._onUp());
    this._preventLooseControls = false
  }

  _removeExploreControls() {
    this.controls.lock(true)
    window.removeEventListener('mousemove', (e) => this._onMouseMove(e));
    window.removeEventListener('touchmove', (e) => this._onMouseMove(e));
    window.removeEventListener('mousedown', (e) => this._onDown(e));
    window.removeEventListener('touchstart', (e) => this._onDown(e));
    window.removeEventListener('touchend', () => this._onUp());
    window.removeEventListener('mouseup', () => this._onUp());
    this._preventLooseControls = true
  }

  _goToHotspot(hotspot) {
    this._preventLooseControls = true
    console.log(hotspot);
    this._removeExploreControls()
    this._addExploreControls()
      // let _m = this._sculptures.activeMesh
      // let _h = _m.data.hotspots[0]
      // this.rx.limit(_h.rx, Math.PI)
      // this.rx.value = _h.rx

    let _rotate = hotspot.rotate
    let _rx = hotspot.rx
    let _radius = hotspot.radius

    if (_rx.limit) {
      this.rx.setTo(this.rx.value < _rx.limit[0] ? _rx.limit[0] : this.rx.value)
      this.rx.setTo(this.rx.value > _rx.limit[1] ? _rx.limit[1] : this.rx.value)
      this.rx.limit(..._rx.limit)
    }

    if (_rotate) {
      this.rotate(_rotate.value)
    }

    this.rxTo(_rx.value)
      //this.rx.setTo(_rx.value || this.rx.value)

    this.radiusTo(hotspot.radius.value)
    this.radius.limit(...hotspot.radius.limit)
      //this.radius.setTo(hotspot.radius.value)

    let pos = hotspot.local || [0, 0, 0]
    let _newPo = glm.vec3.create()
    glm.vec3.copy(_newPo, this._sculptures.activeMesh.position)
    _newPo[1] = 0
    glm.vec3.add(_newPo, _newPo, glm.vec3.fromValues(...pos))

    this._moveTo(_newPo)
    console.log(_newPo);
    // let _cl = Object.assign({}, this._tweenCoordObj)
    // let _c = Object.assign({}, {
    //         x: _h.local[0],
    //         y: _h.local[1],
    //         z: _h.local[2],
    //         ease: Power1.easeInOut,
    //         onUpdate: () => {
    //             this._coordTransfer[0] = _cl.x
    //                 //!!!!!!!HACK
    //             this._coordTransfer[1] = _cl.y
    //             this._coordTransfer[2] = _cl.z
    //             console.log(this._coordTransfer);
    //             this.controls.setPositionOffset(this._coordTransfer)
    //         }
    //     })
    //TweenMax.to(_cl, 1, _c)

    //this._moveTo(_h.local)
    //console.log(_m);
  }

  _setMeshData(data) {
    this._meshData = data
      //this._goToHotspot(data.hotspots[0])
  }


  //----------------------
  //UPDATE
  //----------------------

  _loop() {
    return
    if (this._preventLooseControls) {
      return
    }
    this.ry.value += this._rotateValue
    this._tweenRotateObj.ry = this.ry.value

    let _v = this._getNewAscendValue()
    let _yN = 1 - this._mouse.y / GL.height
    this.controls.positionOffset[1] = _v
    this.controls.center[1] = _v
    this._tweenCoordObj.y = _v
  }

  _onDown(mEvent) {
    this._preventLooseControls = true
  }

  _onUp() {
    this._preventLooseControls = false
  }

  _onCruiseMove(e){
    getMouse(e, this._mouse);
    let _w = GL.width
    let _h = GL.height
    let _yN = (1 - this._mouse.y / _h) - 0.5
    let _Xn = ((1 - this._mouse.x / _w) - 0.5)
    //console.log(_Xn, _yN);
  }

  _onMouseMove(e) {
    if (this._preventLooseControls) {
      return
    }
    getMouse(e, this._mouse);
    let _w = GL.width
    let _h = GL.height

    let _yN = 1 - this._mouse.y / _h
      //this.controls.rx.value += (_yN * -0.5)
    let _hp = (_yN - 0.5) * EXPLORE_FACTOR_Y
    let _wp = ((1 - this._mouse.x / _w) - 0.5) * EXPLORE_FACTOR_X
    this._ascendValue = _hp
    this._rotateValue = _wp
  }

  //----------------------
  // CAMERA
  //----------------------
  setCamera(pos) {
    this.controls.setPositionOffset(pos)
    this.controls.setCenter(pos)
  }

  _getDotRotation(v1, v2) {
    return glm.vec3.dot(v2, v1)
  }

  get positionTransfer() {
    return this._coordTransfer
  }

  set positionTransfer(val) {
    this._assignPropsToModel(val, this._tweenCoordObj, true)
    this._coordTransfer = val
  }

  //----------------------
  // TWEENS
  //----------------------

  moveTo(p, props = {}) {
    this._moveTo(p, props)
  }

  rotate(val, props = {}) {
    this._rotate(val, props)
  }

  radiusTo(val, props = {}) {
    TweenMax.to(...this._getRadius(val, props))
  }

  rxTo(val, props = {}) {
    TweenMax.to(...this._getRx(val, props))
  }

  _lookAtMesh(mesh) {
    let _dot = this._getDotRotation(
      this.controls.getNormalizedPosition(),
      mesh.normalizedPosition) - mesh.rotation
    this._rotate(this.ry.value + _dot)
  }

  _moveTo(p, props = {}) {
    let _p = this._assignPropsToModel(p, this.COORDS)
    let _t = this._createCoordTween(_p, props)
    TweenMax.to(..._t)
  }

  _rotate(val, props = {}) {
    TweenMax.to(...this._getRotate(val, props))
  }

  getMoveTo(p, props = {}) {
    let _p = this._assignPropsToModel(p, this.COORDS)
    let _t = this._createCoordTween(_p, props)
    return _t
  }

  _getRadius(val, props = {}) {
    let _o = Object.assign({}, {
      radius: val,
      overwrite: 1,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this.controls.radius.value = this._tweenRadiusObj.radius
      }
    }, props)

    return [this._tweenRadiusObj,
      props.duration || 1, _o
    ]
  }

  _getRotate(val, props = {}) {
    return this._createRotationTween(val, props)
  }

  _getRx(val, props = {}) {
    let _o = Object.assign({}, {
      rx: val,
      overwrite: 1,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this.rx.value = this._tweenRxObj.rx
      }
    }, props)

    return [this._tweenRxObj,
      props.duration || 1, _o
    ]
  }

  _createCoordTween(data, props = {}) {
    let _c = Object.assign({}, data, {
      //overwrite: 1,
      onUpdate: () => {
        this._coordTransfer[0] = this._tweenCoordObj.x
          //!!!!!!!HACK
        this._coordTransfer[1] = this._tweenCoordObj.y
        this._coordTransfer[2] = this._tweenCoordObj.z
        this.setCamera(this._coordTransfer)
      }
    }, props)
    return [this._tweenCoordObj, props.duration || 1, _c]
  }

  _createRotationTween(val, props = {}) {
    let _o = Object.assign({}, {
      ry: val,
      overwrite: 1,
      ease: Power1.easeInOut,
      onUpdate: () => {
        this.controls.ry.value = this._tweenRotateObj.ry
      }
    }, props)
    return [this._tweenRotateObj, props.duration || 1, _o]
  }



  // bezier(props, duration = 2) {
  //     let _startRadius = this._baseRadius
  //     let _t = this._mix(props)
  //     _t.radius = _startRadius
  //     let _half = this._fly(props)
  //     _half.radius = _startRadius * 2

  //     TweenMax.to(this.coords,
  //         duration, {
  //             bezier: [
  //                 _half,
  //                 _t
  //             ],
  //             overwrite: 1,
  //             ease: Power1.easeOut,
  //             onUpdate: () => {
  //                 this._transfer[0] = this.coords.x
  //                 this._transfer[1] = this.coords.y
  //                 this._transfer[2] = this.coords.z
  //                 this.controls.radius.value = this.coords.radius
  //                 this.controls.setPositionOffset(this._transfer)
  //                 this.controls.setCenter(this._transfer)
  //             }
  //         });
  // }

  _activeMesh() {
    return this._sculptures.activeMesh
  }

  /*
  Array mapped to object following a model
  */
  _assignPropsToModel(props, model, overwrite = false) {
    let _t = {}
    Object.keys(model).forEach((key, i) => {
      if (overwrite) {
        model[key] = props[i]
      } else {
        _t[key] = props[i]
      }
    })
    if (overwrite) {
      _t = model
    }
    return _t
  }

  _getNewAscendValue() {
    let _v = this.controls.positionOffset[1] + this._ascendValue
    _v = Math.min(_v, this._activeMesh().data.maxY)
    _v = Math.max(_v, this._activeMesh().data.minY)
    return _v
  }

  _allowAscend() {}

  _fly(props) {
    let _t = {}
    Object.keys(this.coords).forEach((key, i) => {
      _t[key] = props[i] * 0.5
    })
    _t.y = 20
    return _t
  }

  start() {
    this.anim.start()
  }

  destroy() {
    Scheduler.removeEF(this._scheduleId)
    this._removeExploreControls()
  }
}
