import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import { type ToolState, getDefaultToolState, handleEvent } from './canvas/tools/handler';
import { type GlobalToolSettings, getDefaultSettings } from './canvas/tools/settings';
import { Option, Some } from './func/option';
import { MasterPipeline } from './pipelines/MasterPipeline';
import { type GL } from './web/glUtils';

export interface AppState {
  canvasState: CanvasState;
  settings: GlobalToolSettings;
  toolState: ToolState;
}

let gl: GL;
let appState: AppState;
let masterPipeline: MasterPipeline;
let running: boolean;

export function init(canvas: HTMLCanvasElement) {
  if (gl) return;

  const result = Option.fromNull(
    canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      //premultipliedAlpha: false,
    })
  );

  gl = result.expect('Could not intialize webgl2. Your browser may not support it');

  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const settings = getDefaultSettings()
  appState = {
    canvasState: getDefaultCanvasState(canvas),
    settings,
    toolState: getDefaultToolState(settings),
  };

  masterPipeline = new MasterPipeline(gl);

  initEventListeners(canvas);

  masterPipeline.init(gl, appState);
}

function initEventListeners(canvas: HTMLCanvasElement) {
  const events: (keyof HTMLElementEventMap)[] = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerleave',
    'keydown',
    'keypress',
    'keyup',
  ];

  events.forEach((e) => {
    canvas.addEventListener(e, (ev) => {
      handleEvent({
        map: appState.toolState.tools,
        event: ev,
        currentTool: appState.toolState.currentTool,
        canvasState: appState.canvasState,
        settings: appState.settings,
        presetNumber: Some(0),
      });
    });
  });
}

export function startRenderLoop() {
  if (running) return;

  running = true;
  render();
}

function render() {
  if (!running) return;

  masterPipeline.render(gl, appState);

  window.requestAnimationFrame(render);
}

export function stop() {
  running = false;
  destroy();
}

function destroy() {
  masterPipeline.destroy(gl);
}
