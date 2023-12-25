import type Camera from '~/utils/canvas/camera';
import type FrameBuffer from '~/utils/web/frameBuffer';
import type Func from '../util';
import { GL } from '~/utils/web/glUtils';

interface ClearCanvas {
  clearCanvas: Func<void>;
}

interface EyeDropperArgs {
    canvas: HTMLCanvasElement
    canvasFramebuffer: FrameBuffer
    gl: GL
}
interface ToggleEyeDropper {
    toggleEyeDropper: Func<EyeDropperArgs>
}

type CanvasEvents = [ClearCanvas, ToggleEyeDropper];
export default CanvasEvents;
