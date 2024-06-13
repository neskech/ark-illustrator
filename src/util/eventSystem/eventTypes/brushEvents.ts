import { type BrushPoint } from '~/drawingEditor/canvas/toolSystem/tools/brush';
import type Func from '../util';
import { type BrushSettings } from '~/drawingEditor/canvas/toolSystem/settings/brushSettings';

export interface BrushEventArgs {
  pointData: BrushPoint[];
  currentSettings: BrushSettings;
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

type BrushEvents = [
  BrushStrokeEnd,
  BrushStrokeEndRaw,
  BrushStrokeContinued,
  BrushStrokeContinuedRaw,
  BrushStrokeCutoff
];
export default BrushEvents;
