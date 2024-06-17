import type CanvasRenderModule from './canvasRenderModule';
import { type GL } from '../../webgl/glUtils';
import FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import EventManager from '~/util/eventSystem/eventManager';
import { clearFramebuffer } from '../util';
import OverlayRenderer from './overlayRenderer';
import type AssetManager from '../assetManager';

/* For future extension */
export default class CanvasRenderModuleManager {
  private modules: CanvasRenderModule[];
  private canvasFramebuffer: FrameBuffer;
  private canvasOverlayFramebuffer: FrameBuffer;
  private overlayRenderer: OverlayRenderer;
  private isOverlayBlank: boolean;

  constructor(
    gl: GL,
    canvas: HTMLCanvasElement,
    assetManager: AssetManager,
    modules: CanvasRenderModule[] | null = null
  ) {
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
    clearFramebuffer(gl, this.canvasFramebuffer, 1, 1, 1, 1);
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
    clearFramebuffer(gl, this.canvasOverlayFramebuffer, 1, 1, 1, 1);

    this.overlayRenderer = new OverlayRenderer(gl, assetManager);

    this.isOverlayBlank = true;

    EventManager.subscribe('clearCanvas', (_) => {
      clearFramebuffer(gl, this.canvasFramebuffer);
      clearFramebuffer(gl, this.canvasOverlayFramebuffer);
      this.isOverlayFramebufferBlank(true);
    });
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

  getOverlayRenderer(): OverlayRenderer {
    return this.overlayRenderer
  }

  getCanvasOverlayFramebuffer(): FrameBuffer {
    return this.canvasOverlayFramebuffer;
  }

  isOverlayFramebufferBlank(yesOrNo: boolean) {
    this.isOverlayBlank = yesOrNo;
  }
}
