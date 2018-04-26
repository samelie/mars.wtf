let BLEND = 40

import { getAsset } from '../rad/Utils'

class TM {
    constructor(params = {}) {
        this._imageWidth = params.width || 256
        this._imageHeight = params.height || 768
        this._offset = params.offset || 256
        this._verbose = params.verbose
        this._canvas = document.createElement('canvas')
        this._ctx = this._canvas.getContext('2d')
        this._canvas.width = this._imageWidth
        this._canvas.height = this._imageHeight + this._offset

        if (this._verbose) {
            this._canvas.style.position = 'absolute'
            this._canvas.style.left = params.verboseLeft + 'px'
            this._canvas.style.transformOrigin = '50% 5%'
            this._canvas.style.transform = 'scale(0.5)'
            document.body.appendChild(this._canvas)
        }

        this._y = 0
        this._idIndex = 0
        this._sampleY = 0 //H / 2 +
        this._placeY = this._imageHeight + this._offset

        this._goingDown = true

        if (this._assetId) {
            this.init(this._assetId)
        }

        this._needsUpdate = true
    }

    setTerrains(ids) {
        this._ids = ids
        this._draw(this._ids[this._idIndex])
    }

    getNextTerrainId() {
        let _i = this._idIndex + 1
        if (_i > this._ids.length - 1) {
            _i = 0
        }
        return this._ids[_i]
    }

    getPixelValueAt(x, y) {
        let _idIndex = Math.floor(y / this._imageHeight) % this._ids.length
        this._draw(this._ids[_idIndex])
        x = Math.round(x) + this._imageWidth / 2
        y = Math.round(y % this._imageHeight) + this._imageHeight / 2
        var imgd = this._ctx.getImageData(x, y, 1, 1);
        var pix = imgd.data;
        this._draw(this._ids[this._idIndex])
        return pix[0] / 255
    }

    next() {
        this._idIndex++
            if (this._idIndex > this._ids.length - 1) {
                this._idIndex = 0
            }
        this._draw(this._ids[this._idIndex])
    }

    _completed() {
        this._idIndex++
            if (this._idIndex > this._ids.length - 1) {
                this._idIndex = 0
            }
        this._draw(this._ids[this._idIndex])
    }

    _draw(id, flip = false) {
        id = id || this._ids[this._idIndex]
        this._drawSource(id, flip)
            //this._drawCanvas(id)
    }

    _drawSource(id, flip = false) {
        let _x = flip ? -this._imageWidth : 0
        this._ctx.save()
        if (flip) {
            this._ctx.scale(-1, 1)
        } else {
            this._ctx.scale(1, 1)
        }
        this._ctx.drawImage(getAsset(id), _x, this._offset);
        let _nextId = this.getNextTerrainId()
        this._ctx.drawImage(getAsset(_nextId),
            _x,
            this._imageHeight - this._offset, //draw from bottom of next
            this._imageWidth,
            this._offset,
            0,
            0,
            this._imageWidth,
            this._offset);
        this._ctx.restore()
        this._blendWithNext(this._ctx)
    }

    _blendWithNext(ctx) {
        let _data = ctx.getImageData(0, 0, this._imageWidth, this._imageHeight + this._offset)
        let _nextTerrainStart = 4 * this._imageWidth * (this._offset - BLEND)
        let _terrainStart = 4 * this._imageWidth * (this._offset + BLEND)
        let _total = 4 * this._imageWidth * BLEND
        let pixels = _total;
        let _weight;

        while (pixels--) {
            let _weight = pixels / _total
            let _nextTerrainPixel = Math.floor(_data.data[_nextTerrainStart - pixels] * (_weight))
            let _terrainPixel = Math.floor(_data.data[_terrainStart - pixels] * (1 - _weight))
            _data.data[_terrainStart - pixels] = _nextTerrainPixel + _terrainPixel
        }

        ctx.putImageData(_data, 0, 0)
    }

    /*Blend the sides into the source*/
    blendSide(data, left) {
        let _sideLength = data.data.length
        let _sourceX = left ? 0 : this._imageWidth - BLEND
        let _sourceHeight = this._imageHeight + this._offset
            //let _sourceData = this._ctx.getImageData(0, 0, this._imageWidth, this._imageHeight + this._offset)
        let _sourceData = this._ctx.getImageData(_sourceX, 0, BLEND, _sourceHeight)

        let _total = 4 * _sourceHeight * BLEND
            //let _total = 4 * this._imageWidth * BLEND
        let pixels = _total;
        let _weight = 0
        let _wT = BLEND
            /*while (pixels--) {
                _sourceData.data[pixels] = Math.floor(Math.random() * 255) // _currentPixelR + _newPixelR
                //_sourceData.data[_p + 1] = 0 // _currentPixelG + _newPixelG
                //_sourceData.data[_p + 2] = 0 //_currentPixelB + _newPixelB
                //_sourceData.data[_p + 3] = 255 //_currentPixelA + _newPixelA
            }
            this._ctx.putImageData(_sourceData, 0, 0)
            return*/

        let i = left ? 0 : _total
        i = 0
        let l = left ? _total : 0
        l = _total
        let _a = left ? 4 : -4
        _a = 4
        for (i; i < l; i += _a) {
            let _weight = 1.
            let _roll = i % _sideLength
            _weight = i % (BLEND * 4) / (BLEND * 4)

            if (!left) {
                _weight = 1 - _weight
                    //_weight = 0
            }

            let _newPixelR = Math.floor(data.data[_roll] * (1 - _weight))
            let _newPixelG = Math.floor(data.data[_roll + 1] * (1 - _weight))
            let _newPixelB = Math.floor(data.data[_roll + 2] * (1 - _weight))
            let _newPixelA = Math.floor(data.data[_roll + 3])

            let _currentPixelR = Math.floor(_sourceData.data[i] * _weight)
            let _currentPixelG = Math.floor(_sourceData.data[i + 1] * _weight)
            let _currentPixelB = Math.floor(_sourceData.data[i + 2] * _weight)
            let _currentPixelA = Math.floor(_sourceData.data[i + 3])

            _sourceData.data[i] = _newPixelR + _currentPixelR
            _sourceData.data[i + 1] = _newPixelG + _currentPixelG
            _sourceData.data[i + 2] = _newPixelB + _currentPixelB
            _sourceData.data[i + 3] = 255
        }
        /*console.log(_total, _sourceData.data.length);
        for (let i = 0; i < _wT * 4; i += 3) {
            _weight = i / _wT
            for (let j = 0; j < _sourceHeight * 4; j += 4) {
                let _p = i * j
                let _newPixelR = Math.floor(data.data[_p] * (_weight))
                let _newPixelG = Math.floor(data.data[_p + 1] * (_weight))
                let _newPixelB = Math.floor(data.data[_p + 2] * (_weight))
                let _newPixelA = Math.floor(data.data[_p + 3] * (_weight))

                let _currentPixelR = Math.floor(_sourceData.data[_p] * (1 - _weight))
                let _currentPixelG = Math.floor(_sourceData.data[_p + 1] * (1 - _weight))
                let _currentPixelB = Math.floor(_sourceData.data[_p + 2] * (1 - _weight))
                let _currentPixelA = Math.floor(_sourceData.data[_p + 3] * (1 - _weight))


                _sourceData.data[_p] = 255 // _currentPixelR + _newPixelR
                _sourceData.data[_p + 1] = 0 // _currentPixelG + _newPixelG
                _sourceData.data[_p + 2] = 0 //_currentPixelB + _newPixelB
                _sourceData.data[_p + 3] = 255 //_currentPixelA + _newPixelA
            }
        }*/
        this._ctx.putImageData(_sourceData, _sourceX, 0)
    }

    getSide(left) {
        let _sourceX = left ? 0 : this._imageWidth - BLEND

        let _sourceHeight = this._imageHeight + this._offset
        this._draw(null, true)
        let _sourceData = this._ctx.getImageData(_sourceX, 0, BLEND, _sourceHeight)
        this._draw(null, false)
        return _sourceData
    }

    init(id) {
        this._drawSource(id)
    }

    _getMap(x = 0, y = 0, w = 256, h = 256) {
        return this._ctx.getImageData(x, y, w, h)
    }

    get offset() {
        return this._offset
    }
    set offset(val = [0, 0]) {
        this._offset = val
    }
    get canvas() {
        return this._canvas
    }
    get needsUpdate() {
        return this._needsUpdate
    }

    update(incre = INCRE) {
        let _sIncre = incre
        if (this._countingUp) {
            _sIncre *= -1
        }
        this._sampleY += _sIncre
        this._placeY -= incre
        let y = 0

        this._needsUpdate = false

        if (this._sampleY <= 0 || this._sampleY >= this._imageHeight) {
            this._countingUp = !this._countingUp
        }

        if (this._placeY < this._offset) {
            this._placeY = this._imageHeight + this._offset
            this._completed()
            this._needsUpdate = true
        }

        let _offset = this._placeY - (this._imageHeight)
            //let _d = this._getMap(0, this._sampleY, this._imageWidth, 1)
        if (_offset > 0) {
            //this._ctx.putImageData(_d, 0, _offset)
        }

        //this._ctx.putImageData(_d, 0, this._placeY)
    }
}

export default TM
