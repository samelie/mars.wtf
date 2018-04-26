// ViewEnv.js

import alfrid from '../lib/alfrid';
let GL = alfrid.GL;

import vs from "./sky_vert"
import fs from "./sky_frag"

class ViewSky extends alfrid.View {

	constructor(param = {}) {
		super(vs, fs);
		this._r = param.radius || 500
		this._seg = param.segments || 24

		this.x = 0;
		this.y = -200;
		this.z = 0;
		this._washOutFactor = 1
    this._wasOutTween = {}

		this._sunPosition = []
		this._initMesh()
	}

	enterProductMode(dur){
		this._wasOutTween.val = this._washOutFactor
    TweenLite.to(this._wasOutTween, dur, {
      val: 0,
      overwrite: 1,
      onUpdate: () => {
        this._washOutFactor = this._wasOutTween.val
      }
    })
	}

	exitProductMode(){

	}

	set sun(sun){
		this._sun = sun
	}

	_initMesh() {
		this.mesh = alfrid.Geom.sphere(this._r, this._seg, false, false);
	}

	render(tHorizon) {
		this.shader.bind();
		this.shader.uniform("uHorizon", "uniform1i", 0);
		this.shader.uniform("position", "vec3", [this.x, this.y, this.z]);
		//this.shader.uniform("sunTarget", "vec3", this._sun.target);
		//this.shader.uniform("sunPosition", "vec3", this._sun.position);
		this.shader.uniform("uAngle", "float", this._sun.angle);
		this.shader.uniform("washOutFactor", "float", this._washOutFactor);
		tHorizon.bind(0)
		GL.draw(this.mesh);
	}


}

export default ViewSky;
