import { type GL } from '../web/glUtils';
import { DrawPipeline } from './drawPipeline';
import {
  destroyAll,
  initWithErrorWrapper,
  renderWithErrorWrapper,
} from '../web/renderPipeline';
import { DebugPipeline } from './debugPipeline';
import { type AppState } from '../mainRoutine';

export class MasterPipeline {
  private drawPipeline: DrawPipeline;
  private debugPipeline: DebugPipeline;

  constructor(gl: GL) {
    this.drawPipeline = new DrawPipeline(gl);
    this.debugPipeline = new DebugPipeline(gl);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initWithErrorWrapper(() => this.debugPipeline.init(gl, appState), this.debugPipeline.name);
    //initWithErrorWrapper(() => this.drawPipeline.init(gl, appState), this.drawPipeline.name);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  render(gl: GL, appState: Readonly<AppState>) {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // gl.clearColor(0, 0, 0, 0);
    // gl.colorMask(true, true, true, false);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // renderWithErrorWrapper(
    //   () => this.debugPipeline.render(gl, appState),
    //   this.debugPipeline.name
    // );
    // renderWithErrorWrapper(
    //   () => this.drawPipeline.render(gl, appState),
    //   this.drawPipeline.name
    // );
  }

  destroy(gl: GL) {
    destroyAll(gl, this.debugPipeline);
    destroyAll(gl, this.drawPipeline);
  }
}
