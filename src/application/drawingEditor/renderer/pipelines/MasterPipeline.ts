import type Camera from '../../canvas/camera';
import EventManager from '../../../eventSystem/eventManager';
import { todo } from '../../../general/funUtils';
import { Ok, unit, type Result, type Unit } from '../../../general/result';
import type FrameBuffer from '../../webgl/frameBuffer';
import { type GL } from '../../webgl/glUtils';
import { renderWithErrorWrapper } from '../../webgl/renderPipeline';
import { CanvasPipeline } from './canvasPipeline';
import { StrokePipeline } from './strokePipeline';
import { clearScreen } from '../util';
import { WorldPipeline } from './worldPipeline';

export class MasterPipeline {
  private canvasPipeline: CanvasPipeline;
  private strokePipeline: StrokePipeline;
  private worldPipeline: WorldPipeline;
  private gl: GL;

  constructor(gl: GL, canvas: HTMLCanvasElement) {
    this.canvasPipeline = new CanvasPipeline(gl, canvas);
    this.strokePipeline = new StrokePipeline(gl, canvas);
    this.worldPipeline = new WorldPipeline(gl);
    this.gl = gl;
  }

  async init(camera: Camera): Promise<Result<Unit, string>> {
    const canv = await this.canvasPipeline.init(this.gl);
    if (canv.isErr()) return canv.mapErr((e) => `Canvas pipeline error\n\n${e}`);

    const stroke = await this.strokePipeline.init(this.gl, this.canvasPipeline.getFrameBuffer());
    if (stroke.isErr()) return stroke.mapErr((e) => `Stroke pipeline error\n\n${e}`);

    const world = await this.worldPipeline.init(this.gl, camera);
    if (world.isErr()) return world.mapErr((e) => `World pipeline error\n\n${e}`);

    EventManager.subscribe('appStateMutated', () => this.render(camera));

    EventManager.subscribe('clearCanvas', (_) => {
      this.canvasPipeline.fillFramebufferWithWhite(this.gl);
      this.strokePipeline.refreshCanvasTexture(this.gl, this.canvasPipeline.getFrameBuffer());
    });

    clearScreen(this.gl);

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    return Ok(unit);
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
