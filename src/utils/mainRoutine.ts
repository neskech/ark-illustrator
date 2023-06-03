import { CanvasState, getDefaultCanvasState } from "./canvas/canvas";
import { GlobalToolSettings, getDefaultSettings } from "./canvas/tools/settings";
import { Option } from "./func/option";
import { GL } from "./web/glUtils";

let gl: GL;
let state: CanvasState;
let settings: GlobalToolSettings
let pipelines: 

export function init(canvas: HTMLCanvasElement) {
    const result = Option.fromNull(canvas.getContext('webgl2'));
    gl = result.expect('Could not intialize webgl2. Your browser may not support it');

    state = getDefaultCanvasState(canvas.width, canvas.height);
    settings = getDefaultSettings();
}

export function startRenderLoop() {

}

export function stop() {

}

function destroy() {

}