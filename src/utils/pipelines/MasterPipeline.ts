import { type GL } from '../web/glUtils';
import { renderWithErrorWrapper } from '../web/renderPipeline';
import { type AppState } from '../mainRoutine';
import { clearScreen } from './util';
import { WorldPipeline } from './worldPipeline';
import { CanvasPipeline } from './canvasPipeline';
import { StrokePipeline } from './strokePipeline';
import { todo } from '../func/funUtils';
import EventManager from '../event/eventManager';
import { Ok, type Result, type Unit, unit } from '../func/result';

export class MasterPipeline {
  private canvasPipeline: CanvasPipeline;
  private strokePipeline: StrokePipeline;
  private worldPipeline: WorldPipeline;

  constructor(gl: GL, appState: Readonly<AppState>) {
    this.canvasPipeline = new CanvasPipeline(gl, appState);
    this.strokePipeline = new StrokePipeline(gl, appState);
    this.worldPipeline = new WorldPipeline(gl, appState);
  }

  async init(gl: GL, appState: Readonly<AppState>): Promise<Result<Unit, string>> {
    const canv = await this.canvasPipeline.init(gl, appState)
    if (canv.isErr()) return canv.mapErr(e => `Canvas pipeline error\n\n${e}`)

    const stroke = await this.strokePipeline.init(gl, this.canvasPipeline.getFrameBuffer(), appState)
    if (stroke.isErr()) return stroke.mapErr(e => `Stroke pipeline error\n\n${e}`)

    const world = await this.worldPipeline.init(gl, appState)
    if (world.isErr()) return world.mapErr(e => `World pipeline error\n\n${e}`)
    
    EventManager.subscribe('appStateMutated', () => this.render(gl, appState))
    
    EventManager.subscribe('clearCanvas', _ => {
      this.canvasPipeline.fillFramebufferWithWhite(gl);
      this.strokePipeline.refreshCanvasTexture(gl, this.canvasPipeline.getFrameBuffer());
    })

    clearScreen(gl);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return Ok(unit)
  }

  render(gl: GL, appState: Readonly<AppState>) {
    const finalFramebuffer = this.strokePipeline.getFrameBuffer();
    const finalTexture = finalFramebuffer.getTextureAttachment();

    renderWithErrorWrapper(
      () => this.worldPipeline.render(gl, finalTexture, appState),
      this.worldPipeline.name
    );
  }

  destroy(_: GL) {
    todo();
  }
}
