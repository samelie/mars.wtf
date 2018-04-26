const W = 256
const H = 1536
const OFFSET = 256 //how much is visible from the point of RESET
const RESET = 256
const START = -H / 2
const INCRE = 1

import Emitter from './rad/Emitter'

class TM {
    constructor() {
        this._z = START
        this._passes = 0
        this._height = H
        this._width = W
        this._start = START
        this._offset = OFFSET
        this._reset = RESET
        this._incre = 0

        this._needsUpdate = true
    }

    setParams(p){
        Object.keys(p).forEach(key=>{
            this[key] = p[key]
        })
    }

    get z() {
        return this._z
    }

    set z(v) {
        this._z = v
    }

    set width(w) {
        this._width = w
    }

    set height(h) {
        this._height = h
       // this._start = -this._height / 2
        this._z = this._start + 4
    }

    set start(s) {
        this._start = s
    }

    set offset(r) {
        this._offset = r
    }

    set reset(w) {
        this._reset = w
    }

    get worldZ() {
        return this._height * this._passes + this._z
    }

    get worldZMin() {
        return this._worldMinZ || 0
    }

    get worldZMax() {
        return this._worldMaxZ || this._height
    }

    get needsUpdate(){
        return this._needsUpdate
    }

    get incre(){
        return this._incre
    }

    set pause(p){
        this._paused = p
    }

    get pause(){
        return this._paused || false
    }

    update() {
        if(this._paused){
            return
        }
        this._incre += INCRE
        this._z += INCRE
        this._needsUpdate = false
        if (this._z > this._reset) {
            this._z = this._start
            this._passes++
            this._worldMaxZ = this._height * this._passes + this._height
            this._worldMinZ = this._height * this._passes
            Emitter.emit('movement:complete')
            this._needsUpdate = true
        }
    }
}

const _TM = new TM()

export default _TM
