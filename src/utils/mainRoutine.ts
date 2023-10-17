import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import { type InputState, getDefaultToolState, handleEvent } from './canvas/tools/handler';
import { type GlobalToolSettings, getDefaultSettings } from './canvas/tools/settings';
import { Option, Some } from './func/option';
import { MasterPipeline } from './pipelines/MasterPipeline';
import { type GL } from './web/glUtils';

export interface AppState {
  canvasState: CanvasState;
  settings: GlobalToolSettings;
  inputState: InputState;
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

  const settings = getDefaultSettings(gl);
  appState = {
    canvasState: getDefaultCanvasState(canvas),
    settings,
    inputState: getDefaultToolState(settings),
  };

  masterPipeline = new MasterPipeline(gl, appState);

  initEventListeners(canvas);

  masterPipeline.init(gl, appState);
}

function initEventListeners(canvas: HTMLCanvasElement) {
  const events: (keyof HTMLElementEventMap)[] = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerleave',
    'wheel',
    'keydown',
    'keypress',
    'keyup',
  ];

  events.forEach((e) => {
    canvas.addEventListener(e, (ev) => {
      handleEvent({
        map: appState.inputState.tools,
        event: ev,
        gestures: appState.inputState.gestures,
        shortcuts: appState.inputState.shortcuts,
        currentTool: appState.inputState.currentTool,
        appState: appState,
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
