import Camera from "./camera";
import type Layer from "./layer";

export interface CanvasState {
    layers: Layer[]
    camera: Camera
    readonly canvas: HTMLCanvasElement
}

export function getDefaultCanvasState(canvas: HTMLCanvasElement): CanvasState {
    const aspectRatio = canvas.width / canvas.height;
    const screenAspRation = canvas.clientWidth / canvas.clientHeight;
    console.log(canvas.clientWidth, canvas.width, canvas.clientHeight, canvas.height)
    return {
        layers: [],
        camera: new Camera(aspectRatio, screenAspRation),
        canvas
    }
}