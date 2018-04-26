import { getAsset } from './rad/Utils'
import alfrid, { Scene } from './lib/alfrid'
const GL = alfrid.GL;
class HDRMap {
    constructor(ids) {
        let _tx = []
        ids.forEach(id => {
            _tx.push(alfrid.HDRLoader.parse(getAsset(id)))
        })

        this._texture = new alfrid.GLCubeTexture(_tx);
    }

    get texture(){
        return this._texture
    }

    set texture(t){
        return this._texture = t
    }
}

export default HDRMap;
