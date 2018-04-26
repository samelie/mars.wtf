// ViewEnv.js

import alfrid from '../lib/alfrid';
let GL = alfrid.GL;

import GroundView from "./GroundView"
import SideView from "./SideView"
import ViewAlysEnv from "./ViewAlysEnv"
import SkyView from "./ViewSky"
import MountainView from "./MountainView"

import { getAsset } from '../rad/Utils'

class ViewEnv {

  constructor(param = {}) {
    this.param = param
    this._initTextures()
    this._initMesh()
  }

  _initTextures() {

    this._tHorizon = new alfrid.GLTexture(getAsset('horizon'));

    // this._tWNorm = new alfrid.GLTexture(getAsset('terrain_norm'));
  }

  _initMesh() {
    this._alysEnv = new ViewAlysEnv(this.param.sky)
    this._sky = new SkyView(this.param.sky)
    this._terrain = new GroundView(this.param.ground)
    this._sideLeft = new SideView(this.param.ground.mesh.sides.left)
    this._sideRight = new SideView(this.param.ground.mesh.sides.right)

    this._terrain.sideViews = [this._sideLeft, this._sideRight]
      //this._sideRight = new SideView(this.param.ground.mesh.sides.right)
      // this._terrainLeft = new GroundView(Object.assign({},
      //         this.param.ground, {position:[-256, -20, 0]}))
      //this._terrain.drawAsset(this.param.ground.id)
      //this._mountain1 = new MountainView(this.param.ground.mesh.mountains)
      // this._mountain2 = new MountainView(this.param.mountains[1])
      // this._mountain3 = new MountainView(this.param.mountains[2])
  }

  enterProductMode(dur = 0.7) {
    this._sideLeft.enterProductMode(dur)
    this._sideRight.enterProductMode(dur)
    this._terrain.enterProductMode(dur)
    this._sky.enterProductMode(dur)
    this._isProductMode = true

    setTimeout(() => {
        this._pauseMars = true
    }, dur * 1000)
  }

  exitProductMode() {

  }

  render(renderShadows) {
    GL.disable(GL.CULL_FACE);
    if (this._isProductMode) {
      this._alysEnv.render(this._tHorizon)
    }
    if(!this._pauseMars){
        this._sky.render(this._tHorizon)
        GL.enable(GL.CULL_FACE);
        this._sideLeft.render()
        this._sideRight.render()
        this._terrain.render(renderShadows)
    }
  }

  set sun(sun) {
    this._sideRight.sun = sun
    this._sideLeft.sun = sun
    this._terrain.sun = sun
    this._sky.sun = sun
    this._alysEnv.sun = sun
  }


  get terrain() {
    return this._terrain
  }

}

export default ViewEnv;
