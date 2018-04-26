// ViewEnv.js

import alfrid from '../lib/alfrid';
let GL = alfrid.GL;

import vs from "../shaders/sun_vert"
import fs from "../shaders/basic_frag"

//const INCRE = 0.01
const INCRE = 0.005
const R = 20

class ViewSun extends alfrid.View {

	constructor(cameraControls) {
		super(vs, fs);
		this._cameraControls = cameraControls
		this._x = 0
        this._y = 0
        this._z = -256
        this.scale = 1

        this.radius = R
        this._c = Math.PI

        this._position = []
	}

	_init() {
		this.mesh = alfrid.Geom.sphere(3, 6, false, false);
	}

	set z(z){
		this._z = z
	}

	get position(){
		return this._position
	}

	get angle(){
		return this._c
	}

	updateAngle(){
		this._c += INCRE
		this._x = Math.cos(this._c) * R
		this._y = Math.sin(this._c) * R
		this._position[0] = this._x
		this._position[1] = this._y
		this._position[2] = this._z
	}

	render() {
		if(!this._cameraControls){
			return
		}
		this.shader.bind();
		this.shader.uniform("position", "vec3", [this._x, this._y, this._z]);
    this.shader.uniform("scale", "vec3", [this.scale, this.scale, this.scale]);
    this.shader.uniform("radius", "float", R);
		GL.draw(this.mesh);
	}


}

export default ViewSun;
