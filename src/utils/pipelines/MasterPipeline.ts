import { type GL } from '../web/glUtils';
import { initWithErrorWrapper, renderWithErrorWrapper } from '../web/renderPipeline';
import { type AppState } from '../mainRoutine';
import { clearScreen } from './util';
import { WorldPipeline } from './worldPipeline';
import { CanvasPipeline } from './canvasPipeline';
import { StrokePipeline } from './strokePipeline';
import { todo } from '../func/funUtils';

export class MasterPipeline {
  private canvasPipeline: CanvasPipeline;
  private strokePipeline: StrokePipeline;
  private worldPipeline: WorldPipeline;

  constructor(gl: GL, appState: Readonly<AppState>) {
    this.canvasPipeline = new CanvasPipeline(gl, appState);
    this.strokePipeline = new StrokePipeline(gl, appState);
    this.worldPipeline = new WorldPipeline(gl, appState);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initWithErrorWrapper(() => this.canvasPipeline.init(gl, appState), this.canvasPipeline.name);
    initWithErrorWrapper(
      () => this.strokePipeline.init(gl, this.canvasPipeline.getFrameBuffer(), appState),
      this.strokePipeline.name
    );
    initWithErrorWrapper(() => this.worldPipeline.init(gl, appState), this.worldPipeline.name);

    appState.onAppStateMutated.subscribe(() => {
      this.render(gl, appState);
    }, true);

    appState.inputState.gestures.subscribeToOnScreenClearGesture(() => {
      this.canvasPipeline.fillFramebufferWithWhite(gl);
      this.strokePipeline.refreshCanvasTexture(gl, this.canvasPipeline.getFrameBuffer());
    });

    appState.inputState.shortcuts.subscribeToOnScreenClearClick(() => {
      this.canvasPipeline.fillFramebufferWithWhite(gl);
      this.strokePipeline.refreshCanvasTexture(gl, this.canvasPipeline.getFrameBuffer());
    });

    clearScreen(gl);

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
