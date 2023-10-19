import { type GL } from '../web/glUtils';
import { initWithErrorWrapper, renderWithErrorWrapper } from '../web/renderPipeline';
import { type AppState } from '../mainRoutine';
import { clearScreen } from './util';
import { WorldPipeline } from './worldPipeline';
import { CanvasPipeline } from './canvasPipeline';
import { StrokePipeline } from './strokePipeline';
import { todo } from '../func/funUtils';
import FrameBuffer from '../web/frameBuffer';

export let canvasFrameBuffer: FrameBuffer

export class MasterPipeline {
  private canvasPipeline: CanvasPipeline;
  private strokePreviewPipeline: StrokePipeline;
  private worldPipeline: WorldPipeline;

  constructor(gl: GL, appState: Readonly<AppState>) {
    canvasFrameBuffer = new FrameBuffer(gl, {
      width: appState.canvasState.canvas.width,
      height: appState.canvasState.canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.canvasPipeline = new CanvasPipeline(gl, appState);
    this.strokePreviewPipeline = new StrokePipeline(gl, appState);
    this.worldPipeline = new WorldPipeline(gl, appState);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initWithErrorWrapper(() => this.canvasPipeline.init(gl, appState), this.canvasPipeline.name);
    initWithErrorWrapper(
      () => this.strokePreviewPipeline.init(gl, this.canvasPipeline.getFrameBuffer(), appState),
      this.strokePreviewPipeline.name
    );
    initWithErrorWrapper(() => this.worldPipeline.init(gl, appState), this.worldPipeline.name);

    appState.onAppStateMutated.subscribe(() => {
      this.render(gl, appState);
    }, true);

    appState.inputState.gestures.subscribeToOnScreenClearGesture(() => {
      this.canvasPipeline.fillFramebufferWithWhite(gl);
    });

    clearScreen(gl);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  render(gl: GL, appState: Readonly<AppState>) {
    const finalFramebuffer = this.strokePreviewPipeline.getFrameBuffer();
    const finalTexture = finalFramebuffer.getTextureAttachment();

    renderWithErrorWrapper(
      () => this.worldPipeline.render(gl, finalTexture, appState),
      this.worldPipeline.name
    );
  }

  destroy(_: GL) {
    todo()
  }
}
