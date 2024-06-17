import { type Float32Vector3, type Float32Vector2 } from 'matrixgl';
import { type Option } from '~/util/general/option';
import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import { type GL } from '~/drawingEditor/webgl/glUtils';
import type { Func } from '~/util/general/utilTypes';

interface ClearCanvas {
  clearCanvas: Func<void>;
}

export interface EyeDropperArgs {
  canvas: HTMLCanvasElement;
  canvasFramebuffer: FrameBuffer;
  gl: GL;
  originPosition: Option<Float32Vector2>;
}
interface ToggleEyeDropper {
  toggleEyeDropper: Func<EyeDropperArgs>;
}

interface ColorChanged {
  colorChanged: Func<Float32Vector3>
}

type CanvasEvents = [ClearCanvas, ToggleEyeDropper, ColorChanged];
export default CanvasEvents;
