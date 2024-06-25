import type AssetManager from './util/assetManager';
import type Camera from '../canvas/camera';
import { clearFramebuffer, clearScreen } from './util/util';
import FrameBuffer from '../../util/webglWrapper/frameBuffer';
import { gl } from '../application';
import ToolRenderers from './toolRenderers/toolRendererList';
import PrimaryRenderers from './primaryRenderers/primaryRenderers';
import UtilityRenderers from './utilityRenderers.ts/utilityRenderers';
import type LayerManager from '../canvas/layerManager';

export type RenderContext = {
  assetManager: AssetManager;
  layerManager: LayerManager;
  overlayFramebuffer: FrameBuffer;
  utilityRenderers: UtilityRenderers;
};

export default class Renderer {
  private primaryRenderers: PrimaryRenderers;
  private toolRenderers: ToolRenderers;
  private utilityRenderers: UtilityRenderers;
  private overlayFramebuffer: FrameBuffer;

  constructor(canvas: HTMLCanvasElement, camera: Camera, assetManager: AssetManager) {
    this.initGLFlags(canvas);
    this.overlayFramebuffer = new FrameBuffer({
      type: 'no texture',
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    clearFramebuffer(this.overlayFramebuffer, 1, 1, 1, 1);

    this.primaryRenderers = new PrimaryRenderers(camera, assetManager);
    this.utilityRenderers = new UtilityRenderers(assetManager);
    this.toolRenderers = new ToolRenderers(assetManager);
  }

  public render(camera: Camera, layerManager: LayerManager) {
    this.primaryRenderers.getCanvasRenderer().render(camera, layerManager.getCanvasFramebuffer());
  }

  public getToolRenderers() {
    return this.toolRenderers;
  }

  public getUtilityRenderers() {
    return this.utilityRenderers;
  }

  public getOverlayFramebuffer() {
    return this.overlayFramebuffer;
  }

  private initGLFlags(canvas: HTMLCanvasElement) {
    gl.viewport(0, 0, canvas.width, canvas.height);

    clearScreen();
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
}
