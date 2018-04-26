import alfrid, { Mesh } from '../lib/alfrid';
let GL = alfrid.GL;

export default class Light {
    constructor(perams = {}) {
        this._id = name;
        this._position = perams.position || [0.0, 10.0, 0.0];
        this._ambient = [1.0, 1.0, 1.0, 1.0];
        this._diffuse = [165/255, 93/255, 53/255, 1.0] || perams.diffuse
        this._specular = [0.0, 0.0, 0.0, 0.0];

        this._uniforms = [
            "uLightAmbient",
            "uLightDiffuse",
            "uLightPosition",
        ]
    }

    setPosition(p) {
        this._position = p.slice(0);
    }
    setDiffuse(d) {
        this._diffuse = d.slice(0);
    }

    setAmbient(a) {
        this._ambient = a.slice(0);
    }

    setSpecular(s) {
        this._specular = s.slice(0);
    }

    bind(){
    	GL.useLight(this)
    }

    unbind(){
        GL.useLight(null)
    }

    get position(){
    	return this._position
    }

    get ambient(){
    	return this._ambient
    }

    get diffuse(){
    	return this._diffuse
    }

    get specular(){
    	return this._specular
    }

    get uniforms() {
    	return this._uniforms
    }
}