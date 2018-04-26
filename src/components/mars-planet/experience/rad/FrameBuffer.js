import alfrid, { FrameBuffer } from '../lib/alfrid';
let GL = alfrid.GL;
let gl = GL
import { vec3, mat4 } from 'gl-matrix'

export default class RadBuffer extends FrameBuffer {
    constructor(camera,size, par = {}) {
        super()

        this._camera = camera
        this._position = vec3.fromValues(100, 20, 12.5);
        this._target = vec3.fromValues(0, 0, 0);
        this._direction = vec3.create();
        this._viewMat = mat4.create();
        this._upVec = vec3.fromValues(0, 0, 1);
        this._projectionMat = mat4.create();
        this._dirty = true;
        this.outerAngle = Math.PI * 0.15;
        this._projAngle = this.outerAngle * (180 / Math.PI) * 2.0;
        this._cameraViewMat = mat4.create();
        this._cameraProjMat = mat4.create();
    }

    bind() {
        super.bind()
        if (this._camera) {
            //  mat4.copy(this._cameraViewMat, this._camera.matrix)
            //  mat4.copy(this._cameraProjMat, this._camera.projection)

            // mat4.copy(this._camera.matrix, this._getViewMat())
            // mat4.copy(this._camera.projection, this._getProjectionMat())
        }
    }

    unbind() {
        super.unbind()
        if (this._camera) {
            // mat4.copy(this._camera.matrix, this._cameraViewMat)
            // mat4.copy(this._camera.projection, this._cameraProjMat)
        }
    }

    _getViewMat() {
        mat4.lookAt(this._viewMat,
            this._camera.position,
            this._target,
            this._upVec);
        return this._viewMat;
    }

    _getProjectionMat() {
        //return this._camera.projection
        mat4.perspective(this._projectionMat,
            this._camera._fov,
            this._camera._aspectRatio,
            0.1,
            1000);
        // mat4.perspective(this._projectionMat,
        //     this._fov,
        //     this._camera._aspectRatio,
        //     0.1,
        //     10000);
        return this._projectionMat;
    }
}