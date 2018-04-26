// ViewEnv.js

import alfrid from '../lib/alfrid';
let GL = alfrid.GL;
import { getAsset } from '../rad/Utils'
import vs from "./shaders/out_vert"
import fs from "./shaders/out_frag"
import * as glm from 'gl-matrix';
import _ from 'lodash';
class IntroSky extends alfrid.View {

	constructor() {
		super(vs, fs);
		this._time = 0
		this._transition  = 0
		this._atmosphereIntensity  = 0
		this._noiseAtmosphere  = 0
	}


	_init() {
		this._textureAlbedo = new alfrid.GLTexture(getAsset('albedo'));
		this.mesh = alfrid.Geom.plane(2,2, 4, false, false);
	}

	set transition(v){
		this._transition = v
	}

	set atmosphereIntensity(v){
		this._atmosphereIntensity = v
	}

	set noiseAtmosphere(v){
		this._noiseAtmosphere = v
	}

	updateUniforms(uni){
        _.forIn(uni, (val, key)=>{
            this[key] = val
        })
    }

	render(texture, nextScene) {
		this._time++
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("nextScene", "uniform1i", 1);
		this.shader.uniform("time", "float", this._time);
		this.shader.uniform("atmosphereIntensity", "float", this._atmosphereIntensity);
		this.shader.uniform("noiseAtmosphere", "int", this._noiseAtmosphere);
		this.shader.uniform("fade", "float", this._transition);
		texture.bind(0);
		//this._textureAlbedo.bind(0);
		nextScene.bind(1);
		//ortho.ortho()
		//var eye    = glm.vec3.clone([0, 0, 0] );
		// var center = glm.vec3.create( );
		// var up     = glm.vec3.clone( [0,-1,0] );
		//GL.camera.lookAt(eye, center, up);
		//GL.camera.lookAt()
		GL.draw(this.mesh);
		//console.log(GL.camera.projection);
	}


}

export default IntroSky;