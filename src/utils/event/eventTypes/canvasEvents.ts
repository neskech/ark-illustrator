import { type Float32Vector2 } from 'matrixgl';
import { type Option } from '~/utils/func/option';
import type FrameBuffer from '~/utils/web/frameBuffer';
import { type GL } from '~/utils/web/glUtils';
import type Func from '../util';

interface ClearCanvas {
  clearCanvas: Func<void>;
}

export interface EyeDropperArgs {
    canvas: HTMLCanvasElement
    canvasFramebuffer: FrameBuffer
    gl: GL,
    originPosition: Option<Float32Vector2>
}
interface ToggleEyeDropper {
    toggleEyeDropper: Func<EyeDropperArgs>
}

type CanvasEvents = [ClearCanvas, ToggleEyeDropper];
export default CanvasEvents;
