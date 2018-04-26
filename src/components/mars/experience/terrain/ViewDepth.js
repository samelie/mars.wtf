// ViewDepth.js

import alfrid from '../lib/alfrid';
let GL = alfrid.GL;

import vs from "../shaders/depth_vert"
import fs from "../shaders/depth_frag"

class ViewDepth extends alfrid.View {

	constructor() {
		super(vs, fs);
		this.x = 0
        this.y = 3
        this.z = 10
	}


	_init() {
		this.mesh = alfrid.Geom.plane(4,4, 2, false, false);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("position", "vec3", [this.x, this.y, this.z]);
		this.shader.uniform("scale", "vec3", [1, 1, 1]);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewDepth;
