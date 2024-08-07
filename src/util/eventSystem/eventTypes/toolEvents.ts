
import type { Func } from '~/util/general/utilTypes';
import { type Float32Vector2 } from 'matrixgl';
import { type StampBrushSettings } from '~/drawingEditor/Input/toolSystem/settings/brushSettings';
import { type BrushPoint } from '~/drawingEditor/Input/toolSystem/tools/brushTool/brushTool';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! BRUSH EVENTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface BrushEventArgs {
  pointData: BrushPoint[];
  currentSettings: StampBrushSettings;
}

interface BrushStrokeEnd {
  brushStrokEnd: Func<BrushEventArgs>;
}
interface BrushStrokeEndRaw {
  brushStrokEndRaw: Func<BrushEventArgs>;
}

interface BrushStrokeContinued {
  brushStrokeContinued: Func<BrushEventArgs>;
}

interface BrushStrokeContinuedRaw {
  brushStrokeContinuedRaw: Func<BrushEventArgs>;
}

interface BrushStrokeCutoff {
  brushStrokCutoff: Func<BrushEventArgs>;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! RECTANGLE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export interface RectangleEventArgs {
  anchorPosition: Float32Vector2;
  otherPosition: Float32Vector2;
}

interface RectangleContinued {
  rectangleContinued: Func<RectangleEventArgs>;
}

interface RectangleFinshed {
  rectangleFinished: Func<RectangleEventArgs>;
}

interface RectangleCanceled {
  rectangleCanceled: Func<void>;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! EXPORT
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type ToolEvents = [
  BrushStrokeEnd,
  BrushStrokeEndRaw,
  BrushStrokeContinued,
  BrushStrokeContinuedRaw,
  BrushStrokeCutoff,
  RectangleContinued,
  RectangleFinshed,
  RectangleCanceled
];
export default ToolEvents;
