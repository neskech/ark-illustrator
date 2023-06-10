import { type CanvasState, getDefaultCanvasState } from './canvas/canvas';
import { type ToolState, getDefaultToolState, handleEvent } from './canvas/tools/handler';
import {
  type GlobalToolSettings,
  getDefaultSettings,
} from './canvas/tools/settings';
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
  if (gl)
    return;

  const result = Option.fromNull(canvas.getContext('webgl2', { preserveDrawingBuffer: true }));
  gl = result.expect(
    'Could not intialize webgl2. Your browser may not support it'
  );

  state = getDefaultCanvasState(canvas);
  settings = getDefaultSettings();
  pipelines = getPipelineMap(gl);
  toolState = getDefaultToolState();

  initEventListeners(canvas);

  pipelines.debugPipeline.init(gl, state);
  pipelines.drawPipeline.init(gl, state);
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
        settings: settings,
        presetNumber: Some(0),
      });
    });
  });
}

export function startRenderLoop() {
  if (running)
    return;
    
  running = true;
  render();
}

function render() {
  if (!running) return;

  // gl.clearColor(0, 0, 0, 0);
  // gl.clear(gl.COLOR_BUFFER_BIT);

  pipelines.debugPipeline.render(gl, state);
  pipelines.drawPipeline.render(gl, state);

  window.requestAnimationFrame(render);
}

export function stop() {
  running = false;
  destroy();
}

function destroy() {
  destroyPipelines(gl, pipelines);
}
