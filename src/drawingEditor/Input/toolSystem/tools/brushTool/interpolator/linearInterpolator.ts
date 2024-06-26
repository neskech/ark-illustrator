import { type BrushPoint, newPoint } from '../brushTool';
import { add, copy, scale, sub } from '~/util/webglWrapper/vector';
import { normalize } from '../../../../../../util/webglWrapper/vector';
import { Interpolator } from './interpolator';
import { type BaseBrushSettings } from '../../../settings/brushSettings';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type LinearInterpolatorSettings = {
  type: 'linear';
  spacing: number;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class LinearInterpolator extends Interpolator {
  private settings: LinearInterpolatorSettings;

  constructor(settings: LinearInterpolatorSettings) {
    super('linear');
    this.settings = settings;
  }

  process(points: BrushPoint[]): BrushPoint[] {
    return addPointsLinearInterpolation(points, this.settings.spacing);
  }

  estimateWorstCaseLengthOfOutput(brushSettings: BaseBrushSettings): number {
      const CANVAS_WIDTH = 2
      const at_interval_of_spacing = CANVAS_WIDTH / this.settings.spacing
      return at_interval_of_spacing
  }
}

function addPointsLinearInterpolation(rawCurve: BrushPoint[], spacing: number): BrushPoint[] {
  if (rawCurve.length <= 1) return rawCurve;

  const newPoints = [];
  for (let i = 0; i < rawCurve.length - 1; i++) {
    const start = rawCurve[i];
    const end = rawCurve[i + 1];

    const displacement = sub(copy(end.position), start.position);
    const distance = displacement.magnitude;
    const direction = normalize(displacement);
    const numPointsAlong = Math.ceil(distance / spacing);

    newPoints.push(start);
    for (let j = 0; j < numPointsAlong - 1; j++) {
      const dist = spacing * (j + 1);
      const along = add(scale(copy(direction), dist), start.position);
      const pressure = linearInterpolate(start.pressure, end.pressure, j / numPointsAlong);
      newPoints.push(newPoint(along, pressure));
    }
    newPoints.push(end);
  }

  return newPoints;
}

function linearInterpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
