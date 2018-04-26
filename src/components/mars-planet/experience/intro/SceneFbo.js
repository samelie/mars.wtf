// SceneFbo.js

import alfrid, { Scene } from '../lib/alfrid';

const GL = alfrid.GL;
class SceneFbo extends alfrid.FrameBuffer {
    constructor(w, h, params) {
        super(w, h, params);
    }
    destroy() {
        this.clear()
        this.unbind()
        GL.gl.deleteTexture(this.texture);
        GL.gl.deleteTexture(this.depthTexture);
        GL.gl.deleteFramebuffer(this.frameBuffer);
    }
}


export default SceneFbo;