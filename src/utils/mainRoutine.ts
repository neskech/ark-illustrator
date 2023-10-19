import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import { type InputState, getDefaultToolState, handleEvent } from './canvas/tools/handler';
import { type GlobalToolSettings, getDefaultSettings } from './canvas/tools/settings';
import { Event } from './func/event';
import { Option, Some } from './func/option';
import { MasterPipeline } from './pipelines/MasterPipeline';
import { type GL } from './web/glUtils';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const WebGLDebugUtils: any = require('webgl-debug');

export interface AppState {
  canvasState: CanvasState;
  settings: GlobalToolSettings;
  inputState: InputState;
  onAppStateMutated: Event<void>;
}

let gl: GL;
let appState: AppState;
let masterPipeline: MasterPipeline;

export function init(canvas: HTMLCanvasElement) {
  if (gl) return;

  function throwOnGLError(err: any, funcName: any, args: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-plus-operands
    throw WebGLDebugUtils.glEnumToString(err) + 'was caused by call to ' + funcName;
  }

  const result = Option.fromNull(
    canvas.getContext('webgl2', {
      //preserveDrawingBuffer: true,
      //premultipliedAlpha: false,
    })
  );

  gl = result.expect('Could not intialize webgl2. Your browser may not support it');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError)

  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const settings = getDefaultSettings(gl);
  appState = {
    canvasState: getDefaultCanvasState(canvas),
    settings,
    inputState: getDefaultToolState(settings),
    onAppStateMutated: new Event(),
  };

  masterPipeline = new MasterPipeline(gl, appState);

  initEventListeners(canvas);

  masterPipeline.init(gl, appState);
  appState.onAppStateMutated.invoke();
}

function initEventListeners(canvas: HTMLCanvasElement) {
  const canvasEvents: (keyof HTMLElementEventMap)[] = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerleave',
    'wheel',
    'keydown',
    'keypress',
    'keyup',
  ];

  canvasEvents.forEach((e) => {
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

  const globalEvents: (keyof HTMLElementEventMap)[] = ['keydown', 'keypress', 'keyup'];

  globalEvents.forEach((e) => {
    document.addEventListener(e, (ev) => {
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

export function stop() {
  destroy();
}

function destroy() {
  masterPipeline.destroy(gl);
}
