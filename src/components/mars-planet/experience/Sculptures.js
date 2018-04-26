import ViewAlys from './views/ViewAlys';
import MovementManager from './MovementManager';
import Emitter from './rad/Emitter'

const S_INCRE = 0.3
function _getPosition() {
    return [Math.random() * 100 - 50, 0, 0 - (Math.random() * 10 + 10)]
}

class S {
    constructor(data) {
        this._meshes = []
        this._meshDict = {}
        data.forEach(objData => {
            this._createMesh(objData)
        })

        this._active = 0
        this._navHistory = [this._active]

        Emitter.on('nav:sculptures:next', () => { this.next() })
        Emitter.on('nav:sculptures:nexthotspot', () => { this.nextHotspot() })
    }

    _createMesh(data) {
        let _pos = data.position || _getPosition()
        let _alys = new ViewAlys(data, ..._pos, data.scale, data)
        _alys.createTextures(data.textures)

        this._meshDict[data.id] = _alys

        this._meshes.push(_alys)
        this._numMeshes = this._meshes.length
    }

    useShadowMap(shadowMap) {
        this._meshes.forEach(m => {
            m.useShadowMap(shadowMap)
        })
    }

    setHeightData(ground) {
        this._meshes.forEach(m => {
            let _p = m.position
            m.setHeightValue(ground.pixelValueAt(_p[0], _p[2]))
        })
    }

    nextHotspot() {
        let _current = this.activeMesh
        let _hotspots = this.activeMesh.data.hotspots
        let _maxH = _hotspots.length - 1
        let _n = _current.hotspotIndex + 1
        let _newIndex = _n > _maxH ? 0 : _n
        _current.hotspotIndex = _newIndex
        Emitter.emit('camera:hotspot', this.activeHotspot)
    }

    next() {
        this._active++;
        if (this._active >= this.meshes.length) {
            this._active = 0
        }
        this._navHistory.push(this._active)
        Emitter.emit('nav:mesh:next')
        Emitter.emit('set:meshdata', this.activeMesh.data)
        Emitter.emit('camera:hotspot', this.activeHotspot)
    }

    previous() {
        this._active--;
        if (this._active < 0) {
            this._active = this.meshes.length - 1
        }
        this._navHistory.push(this._active)
        Emitter.emit('nav:mesh:next')
        Emitter.emit('set:meshdata', this.activeMesh.data)
    }

    get meshes() {
        return this._meshes
    }

    get numMeshes() {
        return this._numMeshes
    }

    get activeMesh() {
        return this._meshes[this._active]
    }

    get previousActiveMesh() {
        let i = this._navHistory[this._navHistory.length - 2] || 0
        return this._meshes[i]
    }

    set sun(sun) {
        this._meshes.forEach(m => {
            m.sun = sun
        })
    }

    get activeHotspot() {
        let _current = this.activeMesh
        let _hotspots = this.activeMesh.data.hotspots
        return _hotspots[_current.hotspotIndex]
    }

    meshBy(id) {
        return this._meshDict[id]
    }

    meshAt(i) {
        return this._meshes[i]
    }

    render() {
        let _l = this.numMeshes
        var i = 0
        let _incre = MovementManager.incre// * S_INCRE
        for (i; i < _l; i++) {
            let _m = this.meshAt(i)
            let _baseZ = _m.positionBase[2]

            if(MovementManager.incre > _baseZ - 300 && MovementManager.incre < _baseZ + 100){
                if(!_m.canInteract){
                    _m.canInteract = true
                    Emitter.emit('sculpture:near', i)
                }
            }else if(_m.canInteract){
                _m.canInteract = false
                Emitter.emit('sculpture:out', i)
            }

            if (_baseZ > _incre && _baseZ < _incre + 1400) {
                _m.position[2] = -_m.positionBase[2] + _incre
                _m.render();
            }
            //_m.render(this._textureRad.texture, this._textureIrr.texture);
        }
    }

}

export default S
