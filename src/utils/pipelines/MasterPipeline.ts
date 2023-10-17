import { type GL } from '../web/glUtils';
import { DrawPipeline } from './drawPipeline';
import { destroyAll, initWithErrorWrapper, renderWithErrorWrapper } from '../web/renderPipeline';
import { DebugPipeline } from './debugPipeline';
import { type AppState } from '../mainRoutine';
import { clearScreen } from './util';
import { WorldPipeline } from './worldPipeline';

export class MasterPipeline {
  private drawPipeline: DrawPipeline;
  private worldPipeline: WorldPipeline
  private debugPipeline: DebugPipeline;

  constructor(gl: GL, appState: Readonly<AppState>) {
    this.drawPipeline = new DrawPipeline(gl, appState);
    this.worldPipeline = new WorldPipeline(gl)
    this.debugPipeline = new DebugPipeline(gl);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initWithErrorWrapper(() => this.drawPipeline.init(gl, appState), this.drawPipeline.name);
    initWithErrorWrapper(() => this.worldPipeline.init(gl, appState), this.worldPipeline.name);

    clearScreen(gl)

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  render(gl: GL, appState: Readonly<AppState>) {
     const frameBuffer = this.drawPipeline.getFrameBuffer()
     const canvasTexture = frameBuffer.getTextureAttachment()

    renderWithErrorWrapper(
      () => this.worldPipeline.render(gl, canvasTexture, appState),
      this.drawPipeline.name
    );
  }

  destroy(gl: GL) {
    destroyAll(gl, this.debugPipeline);
    destroyAll(gl, this.drawPipeline);
  }
}

