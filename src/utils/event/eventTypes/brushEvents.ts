import { type BrushPoint } from '~/utils/canvas/tools/brush';
import type Func from '../util';

interface BrushStrokeEnd {
  brushStrokEnd: Func<BrushPoint[]>;
}
interface BrushStrokeEndRaw {
  brushStrokEndRaw: Func<BrushPoint[]>;
}

interface BrushStrokeContinued {
  brushStrokeContinued: Func<BrushPoint[]>;
}

export interface BrushStrokeContinuedRaw {
  brushStrokeContinuedRaw: Func<BrushPoint[]>;
}

export interface BrushStrokeCutoff {
  brushStrokCutoff: Func<BrushPoint[]>;
}

type BrushEvents = [
  BrushStrokeEnd,
  BrushStrokeEndRaw,
  BrushStrokeContinued,
  BrushStrokeContinuedRaw,
  BrushStrokeCutoff
];
export default BrushEvents;
