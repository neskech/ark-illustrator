
import { type Option } from '~/util/general/option';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import type { Func } from '~/util/general/utilTypes';
import { type Vector2, type Vector3 } from 'matrixgl_fork';

interface ClearCanvas {
  clearCanvas: Func<void>;
}

export interface EyeDropperArgs {
  canvas: HTMLCanvasElement;
  canvasFramebuffer: FrameBuffer;
  originPosition: Option<Vector2>;
}
interface ToggleEyeDropper {
  toggleEyeDropper: Func<EyeDropperArgs>;
}

interface ColorChanged {
  colorChanged: Func<Vector3>;
}

interface Undo {
  undo: Func<void>;
}

type CanvasEvents = [ClearCanvas, ToggleEyeDropper, ColorChanged, Undo];
export default CanvasEvents;
