import { Float32Vector2 } from "matrixgl";
import Camera from "./camera";
import type Layer from "./layer";
import { type Path } from "./tools/brush";
import { None, Option } from "../func/option";

export interface CanvasState {
    layers: Layer[]
    camera: Camera
    pointBuffer: Path,
    previousPointBuffer: Path,
    previousDrawnPoint: Option<Float32Vector2>,
    readonly canvas: HTMLCanvasElement
}

export function getDefaultCanvasState(canvas: HTMLCanvasElement): CanvasState {
    const aspectRatio = canvas.width / canvas.height;
    const screenAspRation = canvas.clientWidth / canvas.clientHeight;
    return {
        layers: [],
        camera: new Camera(aspectRatio, screenAspRation),
        pointBuffer: [],
        previousPointBuffer: [],
        previousDrawnPoint: None(),
        canvas
    }
}