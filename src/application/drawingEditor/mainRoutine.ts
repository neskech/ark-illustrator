import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import { type InputState, getDefaultToolState, handleEvent } from './canvas/tools/handler';
import { type GlobalToolSettings, getDefaultSettings } from './canvas/tools/settings';
import EventManager from '../eventSystem/eventManager';
import { Option, Some } from '../general/option';
import { Ok, type Result, Err } from '../general/result';
import { MasterPipeline } from './pipelines/MasterPipeline';

export interface AppState {
  canvasState: CanvasState;
  settings: GlobalToolSettings;
  inputState: InputState;
  renderer: MasterPipeline;
}

/* Temp export so frontend can acces */
export let appState: AppState;

export async function init(canvas: HTMLCanvasElement): Promise<Result<AppState, string>> {
  if (appState) return Ok(appState);

  const result = Option.fromNull(
    canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      //premultipliedAlpha: false,
    })
  );

  const gl = result.expect('Could not intialize webgl2. Your browser may not support it');

  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const settings = getDefaultSettings(gl);
  appState = {
    settings,
    canvasState: getDefaultCanvasState(canvas),
    inputState: getDefaultToolState(settings),
    renderer: new MasterPipeline(gl, canvas),
  };

  initEventListeners(canvas);

  const res = await appState.renderer.init(appState.canvasState.camera);
  if (res.isErr()) return Err(res.unwrapErr());

  EventManager.invokeVoid('appStateMutated');

  return Ok(appState);
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
      console.log(appState.inputState.currentTool.current);
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
  appState.renderer.destroy();
}
