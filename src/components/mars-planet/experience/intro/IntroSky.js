// ViewEnv.js

import alfrid from '../lib/alfrid';
let GL = alfrid.GL;

import vs from "./shaders/intro_sky_vert"
import fs from "./shaders/intro_sky_frag"

class IntroSky extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this._time = 0
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(200, 24, false, false);
	}


	render(texture, textureNebula) {
		this._time++
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureNebula", "uniform1i", 1);
		this.shader.uniform("time", "float", this._time);
		texture.bind(0);
		textureNebula.bind(1);
		GL.draw(this.mesh);
	}


}

export default IntroSky;