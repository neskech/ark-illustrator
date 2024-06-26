import type AssetManager from './util/assetManager';
import Camera from './camera';
import { clearFramebuffer, clearScreen } from './util/renderUtils';
import FrameBuffer from '../../util/webglWrapper/frameBuffer';
import { gl } from '../application';
import ToolRenderers from './toolRenderers/toolRendererList';
import PrimaryRenderers, { type PrimaryRendererContext } from './primaryRenderers/primaryRenderers';
import UtilityRenderers from './utilityRenderers.ts/utilityRenderers';
import type LayerManager from '../canvas/layerManager';

export type RenderContext = {
  assetManager: AssetManager;
  camera: Camera;
  layerManager: LayerManager;
  overlayFramebuffer: FrameBuffer;
  utilityRenderers: UtilityRenderers;
};

export default class Renderer {
  private primaryRenderers: PrimaryRenderers;
  private toolRenderers: ToolRenderers;
  private utilityRenderers: UtilityRenderers;
  private overlayFramebuffer: FrameBuffer;
  private camera: Camera;

  constructor(canvas: HTMLCanvasElement, assetManager: AssetManager) {
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

    const canvasAspectRatio = canvas.width / canvas.height;
    const screenAspRation = canvas.clientWidth / canvas.clientHeight;
    console.log(canvas.clientWidth, canvas.width, canvas.clientHeight, canvas.height);
    this.camera = new Camera(canvasAspectRatio, screenAspRation);

    this.primaryRenderers = new PrimaryRenderers(assetManager, this.camera, canvas);
    this.utilityRenderers = new UtilityRenderers(assetManager);
    this.toolRenderers = new ToolRenderers(assetManager);
  }

  public render(renderContext: PrimaryRendererContext) {
    this.primaryRenderers.render(renderContext);
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

  public getCamera() {
    return this.camera;
  }

  private initGLFlags(canvas: HTMLCanvasElement) {
    gl.viewport(0, 0, canvas.width, canvas.height);

    clearScreen();
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
}
