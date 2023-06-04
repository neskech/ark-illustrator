import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import {
  type GlobalToolSettings,
  getDefaultSettings,
} from './canvas/tools/settings';
import {
  type ToolState,
  getDefaultToolState,
  handleEvent,
} from './canvas/tools/tool';
import { Option, Some } from './func/option';
import getPipelineMap, {
  type PipelineMap,
  destroyPipelines,
} from './pipelines/pipelines';
import { type GL } from './web/glUtils';

let gl: GL;
let state: CanvasState;
let settings: GlobalToolSettings;
let toolState: ToolState;
let pipelines: PipelineMap;
let running: boolean;

export function init(canvas: HTMLCanvasElement) {
  const result = Option.fromNull(canvas.getContext('webgl2'));
  gl = result.expect(
    'Could not intialize webgl2. Your browser may not support it'
  );

  state = getDefaultCanvasState(canvas.width, canvas.height);
  settings = getDefaultSettings();
  pipelines = getPipelineMap(gl);
  toolState = getDefaultToolState();

  initEventListeners(canvas);

  pipelines.debugPipeline.init(gl);
}

function initEventListeners(canvas: HTMLCanvasElement) {
  const events: (keyof HTMLElementEventMap)[] = [
    'mousedown',
    'mousemove',
    'mouseup',
    'keydown',
    'keypress',
    'keyup',
  ];

  events.forEach((e) => {
    canvas.addEventListener(e, (ev) => {
      handleEvent({
        map: toolState.tools,
        event: ev,
        currentTool: toolState.currentTool,
        canvasState: state,
        globalSettings: settings,
        presetNumber: Some(0),
      });
    });
  });
}

export function startRenderLoop() {
  running = true;
  render();
}

function render() {
  if (!running) return;

  pipelines.debugPipeline.render(gl);

  window.requestAnimationFrame(render);
}

export function stop() {
  running = false;
  destroy();
}

function destroy() {
  destroyPipelines(gl, pipelines);
}
