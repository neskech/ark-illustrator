import { gl } from '../../application';
import type FrameBuffer from '../../../util/webglWrapper/frameBuffer';

export function clearScreen(r = 1, g = 1, b = 1, a = 1) {
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

export function clearFramebuffer(framebuffer: FrameBuffer, r = 1, g = 1, b = 1, a = 0) {
  framebuffer.bind();
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
  framebuffer.unBind();
}
