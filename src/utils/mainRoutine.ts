import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import { type InputState, getDefaultToolState, handleEvent } from './canvas/tools/handler';
import { type GlobalToolSettings, getDefaultSettings } from './canvas/tools/settings';
import EventManager from './event/eventManager';
import { Option, Some } from './func/option';
import { Ok, type Result, Err } from './func/result';
import { MasterPipeline } from './pipelines/MasterPipeline';
import { type GL } from './web/glUtils';

export interface AppState {
  canvasState: CanvasState;
  settings: GlobalToolSettings;
  inputState: InputState;
}

let gl: GL;
/* Temp export so frontend can acces */
export let appState: AppState;
let masterPipeline: MasterPipeline;

export async function init(canvas: HTMLCanvasElement): Promise<Result<AppState, string>> {
  if (gl) return Ok(appState);

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
    inputState: getDefaultToolState(settings)
  };

  masterPipeline = new MasterPipeline(gl, appState);

  initEventListeners(canvas);

  const res = await masterPipeline.init(gl, appState);
  if (res.isErr()) return Err(res.unwrapErr())

  EventManager.invokeVoid('appStateMutated')

  return Ok(appState)
}

function initEventListeners(canvas: HTMLCanvasElement) {
  const canvasEvents: (keyof HTMLElementEventMap)[] = [
    'pointerdown',
    'pointermove',
    'pointerup',
    'pointerleave',
    'pointercancel',
    'pointerout',
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
        currentTool: appState.inputState.currentTool.current,
        appState: appState,
        settings: appState.settings,
        presetNumber: Some(0),
      });
    });
  });

  const globalEvents: (keyof HTMLElementEventMap)[] = ['keydown', 'keypress', 'keyup'];

  globalEvents.forEach((e) => {
    document.addEventListener(e, (ev) => {
      console.log(appState.inputState.currentTool.current)
      handleEvent({
        map: appState.inputState.tools,
        event: ev,
        gestures: appState.inputState.gestures,
        shortcuts: appState.inputState.shortcuts,
        currentTool: appState.inputState.currentTool.current,
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
