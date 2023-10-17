import { type GL } from '../web/glUtils';
import { destroyAll, initWithErrorWrapper, renderWithErrorWrapper } from '../web/renderPipeline';
import { DebugPipeline } from './debugPipeline';
import { type AppState } from '../mainRoutine';
import { clearScreen } from './util';
import { WorldPipeline } from './worldPipeline';
import { CanvasPipeline } from './canvasPipeline';
import { StrokePreviewPipeline } from './strokePreviewPipeline';

export class MasterPipeline {
  private canvasPipeline: CanvasPipeline;
  private strokePreviewPipeline: StrokePreviewPipeline
  private worldPipeline: WorldPipeline
  private debugPipeline: DebugPipeline;

  constructor(gl: GL, appState: Readonly<AppState>) {
    this.canvasPipeline = new CanvasPipeline(gl, appState)
    this.strokePreviewPipeline = new StrokePreviewPipeline(gl, appState)
    this.worldPipeline = new WorldPipeline(gl, appState)
    this.debugPipeline = new DebugPipeline(gl, appState);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initWithErrorWrapper(() => this.canvasPipeline.init(gl, appState), this.canvasPipeline.name);
    initWithErrorWrapper(() => this.strokePreviewPipeline.init(gl, appState), this.strokePreviewPipeline.name);
    initWithErrorWrapper(() => this.worldPipeline.init(gl, appState), this.worldPipeline.name);

    clearScreen(gl)

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  render(gl: GL, appState: Readonly<AppState>) {
    const canvasFrameBuffer = this.canvasPipeline.getFrameBuffer()
    const canvasTexture = canvasFrameBuffer.getTextureAttachment()

    const previewFrameBuffer = this.strokePreviewPipeline.getFrameBuffer()
    const previewTexture = previewFrameBuffer.getTextureAttachment()

    renderWithErrorWrapper(
      () => this.worldPipeline.render(gl, canvasTexture, previewTexture, appState),
      this.worldPipeline.name
    );
  }

  destroy(gl: GL) {
    destroyAll(gl, this.debugPipeline);
    destroyAll(gl, this.worldPipeline)
    destroyAll(gl, this.canvasPipeline)
    destroyAll(gl, this.strokePreviewPipeline)
  }
}

