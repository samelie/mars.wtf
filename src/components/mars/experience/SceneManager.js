import SceneData, { findObjectsWithKey } from './SceneData'
import SceneIntro from './intro/IntroScene'
import SceneGen from './SceneGen'
import Mvnmt from './MovementManager'

import _ from 'lodash'

import Emitter from './rad/Emitter'

import AssetsLoader from 'assets-loader';

export default class SceneManager {
  constructor() {
    this._sceneIndex = 1

    this._init()
  }

  _init() {
    this._loadAssets()

    //gui.add(this, 'next');
    //gui.add(this, 'nextHotpot');
    //gui.add(this, 'pauseMovement')

    window.addEventListener('keyup', (e) => {
      if (e.keyCode === 82) this.next()
    });

    Emitter.on('intro:complete', () => this._loadMars())

    Emitter.on('sculpture:near', () => this._onNear())
  }

  _loadAssets() {

    this._sceneData = SceneData[this._sceneIndex]

    let objs = findObjectsWithKey(this._sceneData, 'url')

    let _srs = []
    objs.forEach(obj => {
      let { id, url, type } = obj

      url = process.env.REMOTE_ASSETS_DIR + url
      _srs.push({ id, url, type, crossOrigin: 'anonymous' })
    })

    let loader = new AssetsLoader({
        assets: _srs
      }).on('error', (error) => {
        console.error(error);
      }).on('progress', (p) => {
        Emitter.emit('exp:progress', p)
        //console.log('Progress : ', p);
      }).on('complete', this._onAssetsLoaded.bind(this))
      .start();
  }

  _onAssetsLoaded(sceneAssets) {
    window.assets = sceneAssets
    switch (this._sceneData.type) {
      case 'intro':
        this._scene = new SceneIntro(this._sceneData)
        break;
      case 'mars':
        this._scene = new SceneGen(this._sceneData)
        break;
    }
    this._scene.pause = !!this._pause
    Emitter.emit('exp:loaded')
  }

  _loadMars() {
    this._scene.destroy()
    this._sceneIndex = 1
    this._loadAssets()
  }

  _onNear() {

  }

  //-----------
  //-----------

  set pause(v) {
    this._pause = v
    if (this._scene) {
      this._scene.pause = v
    }
  }

  next() {
    Emitter.emit('nav:sculptures:next')
  }

  nextHotpot() {
    Emitter.emit('nav:sculptures:nexthotspot')
  }

  pauseMovement() {
    let _p = Mvnmt.pause
    Mvnmt.pause = !_p
  }

  on(event,cb){
    Emitter.on(`exp:${event}`, cb)
  }
}
