import { type BrushPoint, newPoint } from '../brushTool';
import { CurveInterpolator } from 'curve-interpolator';
import { Interpolator } from './interpolator';
import { Vector2 } from 'matrixgl_fork';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type SmoothedInterpolatorSettings = {
  type: 'smoothed';
  alpha: number;
  tension: number;
  spacing: number;
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export class SmoothedInterpolator extends Interpolator {
  private settings: SmoothedInterpolatorSettings;

  constructor(settings: SmoothedInterpolatorSettings) {
    super('smoothed');
    this.settings = settings;
  }

  process(points: BrushPoint[]): BrushPoint[] {
    return addPointsCartmollInterpolation(
      points,
      this.settings.tension,
      this.settings.alpha,
      this.settings.spacing
    );
  }

  processWithSingularContext(points: BrushPoint[], context: BrushPoint): BrushPoint[] {
    points.unshift(context);
    const processed = this.process(points);
    processed.shift();
    points.shift();
    return processed;
  }

  estimateOutputSize(inputPathLength: number): number {
    const at_interval_of_spacing = inputPathLength / this.settings.spacing;
    return at_interval_of_spacing;
  }
}

function addPointsCartmollInterpolation(
  rawCurve: BrushPoint[],
  tension: number,
  alpha: number,
  spacing: number
): BrushPoint[] {
  if (rawCurve.length <= 1) return rawCurve;

  const points = rawCurve.map((p) => [p.position.x, p.position.y]);
  const interpolator = new CurveInterpolator(points, {
    tension,
    alpha,
  });

  const curveDist = interpolator.getLengthAt(1);
  const numSteps = Math.ceil(curveDist / spacing);

  const output: BrushPoint[] = [];
  for (let i = 0; i < numSteps; i++) {
    const parameter = Math.min(1, (spacing * i) / curveDist);
    const point = interpolator.getPointAt(parameter);
    output.push(newPoint(new Vector2(point[0], point[1]), 1));
  }

  return output;
}
