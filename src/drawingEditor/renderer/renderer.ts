import { type GL } from '../webgl/glUtils';
import type AssetManager from './util/assetManager';
import type Camera from '../canvas/camera';
import { clearFramebuffer, clearScreen } from './util/util';
import FrameBuffer from '../webgl/frameBuffer';
import { gl } from '../application';
import ToolRenderers from './toolRenderers/toolRendererList';
import PrimaryRenderers from './primaryRenderers/primaryRenderers';
import UtilityRenderers from './utilityRenderers.ts/utilityRenderers';
export default class Renderer {
  private primaryRenderers: PrimaryRenderers;
  private toolRenderers: ToolRenderers;
  private utilityRenderers: UtilityRenderers;
  private canvasFramebuffer: FrameBuffer;
  private overlayFramebuffer: FrameBuffer;

  constructor(canvas: HTMLCanvasElement, camera: Camera, assetManager: AssetManager) {
    this.initGLFlags(canvas);
    this.canvasFramebuffer = new FrameBuffer({
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.overlayFramebuffer = new FrameBuffer({
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    clearFramebuffer(this.canvasFramebuffer, 1, 1, 1, 1);
    clearFramebuffer(this.overlayFramebuffer, 1, 1, 1, 1);

    this.primaryRenderers = new PrimaryRenderers(camera, assetManager);
    this.utilityRenderers = new UtilityRenderers(assetManager);
    this.toolRenderers = new ToolRenderers({
      canvasFramebuffer: this.canvasFramebuffer,
      canvasOverlayFramebuffer: this.overlayFramebuffer,
      assetManager: assetManager,
      utilityRenderers: this.utilityRenderers,
    });
  }

  public render() {
    this.primaryRenderers.getCanvasRenderer().render(this.canvasFramebuffer);
  }

  public getToolRenderers() {
    return this.toolRenderers;
  }

  private initGLFlags(canvas: HTMLCanvasElement) {
    gl.viewport(0, 0, canvas.width, canvas.height);

    clearScreen();
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
}
