import { Vector2 } from 'matrixgl_fork';
import { type BrushPoint, newPoint } from '../brushTool';
import { Interpolator } from './interpolator';

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

  processWithSingularContext(points: BrushPoint[], context: BrushPoint): BrushPoint[] {
    points.unshift(context);
    const processed = this.process(points);
    processed.shift();
    points.shift();
    return processed;
  }

  /*
    Output = InputLength / spacing
    InputLength = Output * spacing
  */
  estimateOutputSize(inputPathLength: number): number {
    const at_interval_of_spacing = inputPathLength / this.settings.spacing;
    return at_interval_of_spacing;
  }
}

function addPointsLinearInterpolation(rawCurve: BrushPoint[], spacing: number): BrushPoint[] {
  if (rawCurve.length <= 1) return rawCurve;

  const newPoints = [];
  for (let i = 0; i < rawCurve.length - 1; i++) {
    const start = rawCurve[i];
    const end = rawCurve[i + 1];

    const distance = Vector2.distance(start.position, end.position);
    const numPointsAlong = Math.ceil(distance / spacing);

    newPoints.push(start);
    for (let j = 0; j < numPointsAlong - 1; j++) {
      const dist = spacing * (j + 1);
      const along = Vector2.lerpByDistance(start.position, end.position, dist);
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
