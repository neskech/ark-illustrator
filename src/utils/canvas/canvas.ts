import type Camera from "./camera";
import type Layer from "./layer";

export interface CanvasState {
    layers: Layer[]
    camera: Camera
}