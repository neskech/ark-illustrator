import type Camera from '../../canvas/camera';
import EventManager from '../../../util/eventSystem/eventManager';
import { todo } from '../../../util/general/funUtils';
import type FrameBuffer from '../../webgl/frameBuffer';
import { type GL } from '../../webgl/glUtils';
import { renderWithErrorWrapper } from '../../webgl/renderPipeline';
import { CanvasPipeline } from './canvasPipeline';
import { StrokePipeline } from './strokePipeline';
import { clearScreen } from '../util';
import { WorldPipeline } from './worldPipeline';
import type AssetManager from '../assetManager';

export class MasterPipeline {
  private canvasPipeline: CanvasPipeline;
  private strokePipeline: StrokePipeline;
  private worldPipeline: WorldPipeline;
  private gl: GL;

  constructor(gl: GL, canvas: HTMLCanvasElement, assetManager: AssetManager) {
    this.canvasPipeline = new CanvasPipeline(gl, canvas, assetManager);
    this.strokePipeline = new StrokePipeline(gl, canvas, assetManager);
    this.worldPipeline = new WorldPipeline(gl, assetManager);
    this.gl = gl;
  }

  init(camera: Camera) {
    this.canvasPipeline.init(this.gl);
    this.strokePipeline.init(this.gl, this.canvasPipeline.getFrameBuffer());
    this.worldPipeline.init(this.gl, camera);

    EventManager.subscribe('appStateMutated', () => this.render(camera));

    EventManager.subscribe('clearCanvas', (_) => {
      this.canvasPipeline.fillFramebufferWithWhite(this.gl);
      this.strokePipeline.refreshCanvasTexture(this.gl, this.canvasPipeline.getFrameBuffer());
    });

    clearScreen(this.gl);

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  render(camera: Camera) {
    const finalFramebuffer = this.strokePipeline.getFrameBuffer();
    const finalTexture = finalFramebuffer.getTextureAttachment();

    renderWithErrorWrapper(
      () => this.worldPipeline.render(this.gl, finalTexture, camera),
      this.worldPipeline.name
    );
  }

  getGLHandle(): GL {
    return this.gl;
  }

  getCanvasFramebuffer(): FrameBuffer {
    return this.canvasPipeline.getFrameBuffer();
  }

  destroy() {
    todo();
  }
}
