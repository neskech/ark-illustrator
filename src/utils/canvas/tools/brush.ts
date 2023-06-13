import { assert, requires } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
import { type BrushSettings } from './settings';
import { Float32Vector2 } from 'matrixgl';
import { add, copy, distance, distanceAlong, scale } from '~/utils/web/vector';
import { None } from '~/utils/func/option';
import { CurveInterpolator, CurveInterpolator2D } from 'curve-interpolator';
import { Vector } from 'curve-interpolator/dist/src/core/interfaces';
import { normalize } from '../../web/vector';
import { get } from 'http';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const MAX_POINTS_IN_BUFFER = 20;

export class Brush extends Tool {
  isMouseDown: boolean;

  constructor() {
    super();
    this.isMouseDown = false;
  }

  handleEvent(args: HandleEventArgs): boolean {
    const preset = args.presetNumber.expect('Brush needs preset number');
    requires(this.areValidBrushSettings(args.settings.brushSettings[preset]));

    const evType = args.eventString;
    const event = args.event as MouseEvent;

    switch (evType) {
      case 'mouseleave':
        return this.mouseLeaveHandler(args);
      case 'mousemove':
        return this.mouseMovedHandler(args, event);
      case 'mouseup':
        return this.mouseUpHandler(args, event);
      case 'mousedown':
        return this.mouseDownHandler(args, event);
      default:
        return false;
    }
  }

  mouseMovedHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { canvasState, settings, presetNumber } = args;

    const hasSpace = canvasState.pointBuffer.length < MAX_POINTS_IN_BUFFER;
    const point = canvasState.camera.mouseToWorld(event, canvasState);
    if (hasSpace && this.isMouseDown) canvasState.pointBuffer.push(point);

    return hasSpace && this.isMouseDown;
  }

  mouseUpHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const prevPoint = args.canvasState.previousDrawnPoint;
    const isSome = prevPoint.isSome();
    if (isSome) args.canvasState.previousDrawnPoint = None();

    this.isMouseDown = false;
    return isSome;
  }

  mouseDownHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { canvasState, settings, presetNumber } = args;

    const hasSpace = canvasState.pointBuffer.length < MAX_POINTS_IN_BUFFER;
    const point = canvasState.camera.mouseToWorld(event, canvasState);
    if (hasSpace && !this.isMouseDown) canvasState.pointBuffer.push(point);

    //canvasState.camera.translateZoom(0.1);

    this.isMouseDown = true;

    return hasSpace && !this.isMouseDown;
  }

  mouseLeaveHandler(args: HandleEventArgs): boolean {
    this.isMouseDown = false;

    const prevPoint = args.canvasState.previousDrawnPoint;
    const isSome = prevPoint.isSome();
    if (isSome) args.canvasState.previousDrawnPoint = None();

    return isSome;
  }

  areValidBrushSettings(b: BrushSettings): boolean {
    return 0 <= b.opacity && b.opacity <= 100 && 0 <= b.smoothing && b.smoothing <= 100;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type Path = Float32Vector2[];
type SmoothFunction = 'Bezier';

const MAX_BEZIER_INTERPOLATIONS = 3;
interface SmoothingOptions {
  initialPoint: Float32Vector2;
  minDistanceBetweenPoints: number;
  interp: CurveInterpolator;
  initialLength?: number;
}

function applySmoothing({
  initialPoint,
  interp,
  initialLength,
  minDistanceBetweenPoints,
}: SmoothingOptions): Path {
  const p = [] as Path;

  const initialU =
    initialLength ?? interp.getNearestPosition([initialPoint.x, initialPoint.y], 0.1).u;
  const totalLength = interp.getLengthAt(1.0);

  let accumU = initialU;
  while (accumU < 1.0) {
    const point = interp.getPointAt(accumU);
    p.push(new Float32Vector2(point[0], point[1]));
    accumU += minDistanceBetweenPoints / totalLength;
  }

  const finalPoint = interp.getPointAt(1.0);
  p.push(new Float32Vector2(finalPoint[0], finalPoint[1]));

  return p;
}

type MidpointReturn = {
  path: Path;
  initialPointU: number;
};

function NMidpoints(
  interp: CurveInterpolator,
  midpointPower: number,
  initialPoint: Float32Vector2
): MidpointReturn {
  requires(0 < midpointPower && midpointPower <= 5);

  const initialPointU = interp.getNearestPosition(
    [initialPoint.x, initialPoint.y],
    0.1
  ).u;

  const numMidpoints = Math.pow(2, midpointPower);
  const totalDist = interp.getLengthAt(1);
  const deltaDistance = totalDist / numMidpoints;

  const p = [] as Path;
  const getU = (i: number) => (deltaDistance * i) / totalDist;

  for (let i = 0; i < numMidpoints; i++) {
    if (i > 0 && getU(i - 1) <= initialPointU && initialPointU <= getU(i))
      p.push(initialPoint);

    const u = getU(i);
    const point = interp.getPointAt(u);
    p.push(new Float32Vector2(point[0], point[1]));
  }

  const last = interp.getPointAt(1.0);
  p.push(new Float32Vector2(last[0], last[1]));

  return {
    path: p,
    initialPointU,
  };
}

interface ProcessingOptions {
  path: Path;
  prevPathBuf: Path;
  maxPrevPoints: number;
  stabilization: number;
  minDistanceBetween: number;
  numMidpoints?: number;
  alpha?: number;
}

export function processPath(args: ProcessingOptions): Path {
  if (args.path.length == 0) return [];

  //handle the prev point buffer
  const numToAppend = args.path.length;
  const delta = args.maxPrevPoints - (args.prevPathBuf.length + numToAppend);
  const numToPop = Math.min(0, delta);

  for (let i = 0; i < numToPop; i++) args.prevPathBuf.shift();

  args.prevPathBuf.concat(args.path);
  const initialPoint = args.path[0];

  //optionally apply midpoint
  let points = args.prevPathBuf;
  let initialU;
  if (args.numMidpoints != null) {
    const controlPoints = args.prevPathBuf.map((v) => [v.x, v.y]);
    const midpointInterp = new CurveInterpolator(controlPoints, {
      tension: args.stabilization,
      alpha: args.alpha ?? 1.0,
    });

    const result = NMidpoints(midpointInterp, args.numMidpoints, initialPoint);
    points = result.path;
    initialU = result.initialPointU;
  }

  //smooth it
  const controlPoints = points.map((v) => [v.x, v.y]);
  const finalInterp = new CurveInterpolator(controlPoints, {
    tension: args.stabilization,
    alpha: args.alpha ?? 1.0,
  });

  const smoothed = applySmoothing({
    interp: finalInterp,
    minDistanceBetweenPoints: args.minDistanceBetween,
    initialLength: initialU,
    initialPoint,

  })

  return smoothed;
}
