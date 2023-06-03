import Camera from "./camera";
import type Layer from "./layer";

export interface CanvasState {
    layers: Layer[]
    camera: Camera
    readonly canvasWidth: number,
    readonly canvasHeight: number
}

export function getDefaultCanvasState(canvasWidth: number, canvasHeight: number): CanvasState {
    const aspectRatio = canvasWidth / canvasHeight;
    return {
        layers: [],
        camera: new Camera(aspectRatio, aspectRatio),
        canvasWidth,
        canvasHeight
    }
}