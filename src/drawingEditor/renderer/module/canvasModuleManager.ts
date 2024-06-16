import type CanvasRenderModule from './canvasRenderModule';
import { type GL } from '../../webgl/glUtils';
import FrameBuffer from '~/drawingEditor/webgl/frameBuffer';

/* For future extension */
export default class CanvasRenderModuleManager {
  private modules: CanvasRenderModule[];
  private canvasFramebuffer: FrameBuffer;
  private canvasOverlayFramebuffer: FrameBuffer;
  private isOverlayBlank: boolean;

  constructor(gl: GL, canvas: HTMLCanvasElement, modules: CanvasRenderModule[] | null = null) {
    this.modules = modules ?? [];
    this.canvasFramebuffer = new FrameBuffer(gl, {
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.canvasOverlayFramebuffer = new FrameBuffer(gl, {
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.isOverlayBlank = true;
  }

  addModule(module: CanvasRenderModule) {
    this.modules.push(module);
  }

  getCanvasFramebufferInUse(): FrameBuffer {
    if (this.isOverlayBlank) return this.canvasFramebuffer;
    return this.canvasOverlayFramebuffer;
  }

  getCanvasFramebuffer(): FrameBuffer {
    return this.canvasFramebuffer;
  }

  getCanvasOverlayFramebuffer(): FrameBuffer {
    return this.canvasOverlayFramebuffer;
  }

  isOverlayFramebufferBlank(yesOrNo: boolean) {
    this.isOverlayBlank = yesOrNo;
  }
}
