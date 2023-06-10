import Camera from "./camera";
import type Layer from "./layer";
import { type Path } from "./tools/brush";

export interface CanvasState {
    layers: Layer[]
    camera: Camera
    pointBuffer: Path
    readonly canvasWidth: number
    readonly canvasHeight: number
    readonly canvasRect: DOMRect
}

export function getDefaultCanvasState(canvas: HTMLCanvasElement): CanvasState {
    const aspectRatio = canvas.width / canvas.height;
    const screenAspRation = canvas.clientWidth / canvas.clientHeight;
    return {
        layers: [],
        camera: new Camera(aspectRatio, screenAspRation),
        pointBuffer: [],
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        canvasRect: canvas.getBoundingClientRect()
    }
}