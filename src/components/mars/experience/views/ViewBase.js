// ViewBase.js

import alfrid, { Mesh } from '../lib/alfrid';
let GL = alfrid.GL;
import vs from "./pbr_vert"
import fs from "./pbr_frag"
import * as glm from 'gl-matrix';
import _ from 'lodash';
import { getAsset } from '../rad/Utils'

class ViewBase extends alfrid.View {

    constructor(vs,fs) {
        super(vs, fs);
    }

    createTextures(data){
        _.forIn(data, t=>{
            let _id = t.id
            this._texures.push(new alfrid.GLTexture(getAsset(_id)));
            this._texuresLength++
        })
    }

    _bindModelTextures(){
        for (var i = 0; i < this._texuresLength; i++) {
            this._texures[i].bind(i)
        }
    }

    get position(){
        return glm.vec3.add(this._worldPosition, this._position, this._positionOffset)
    }

    get animationPosition(){

    }

    get normalizedPosition(){
        return this._positionNormalized
    }

    destroy(){
        for (var i = 0; i < this._texures.length; i++) {
            this._texures[i].destroy()
        }
        this._texures.length=0
        this._texures = null
    }


}

export default ViewBase;
