import { requires } from '../../contracts';
import { assert } from '../../contracts';
import { Tool, type HandleEventArgs } from './tool';
import { type BrushSettings } from './settings';
import { Float32Vector2 } from 'matrixgl';
import { add, copy, distance, distanceAlong, scale } from '~/utils/web/vector';
import { mouseToNDC } from '../camera';

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
        return this.mouseLeaveHandler();
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
    if (hasSpace && this.isMouseDown)
      canvasState.pointBuffer.push(point)

    return hasSpace && this.isMouseDown;
  }

  mouseUpHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { canvasState, settings, presetNumber } = args;
    canvasState.camera.translatePosition(new Float32Vector2(0.1, 0))
    this.isMouseDown = false;
    return false;
  }

  mouseDownHandler(args: HandleEventArgs, event: MouseEvent): boolean {
    const { canvasState, settings, presetNumber } = args;

    const hasSpace = canvasState.pointBuffer.length < MAX_POINTS_IN_BUFFER;
    const point = canvasState.camera.mouseToWorld(event, canvasState);
    if (hasSpace && !this.isMouseDown)
      canvasState.pointBuffer.push(point)

    //canvasState.camera.translateZoom(0.1);

    this.isMouseDown = true;

    return hasSpace && !this.isMouseDown;
  }

  mouseLeaveHandler(): boolean {
    this.isMouseDown = false;
    return false;
  }

  areValidBrushSettings(b: BrushSettings): boolean {
    return (
      0 <= b.opacity &&
      b.opacity <= 100 &&
      0 <= b.smoothing &&
      b.smoothing <= 100
    );
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
  path: Path;
  maxPointsToSmooth: number;
  minDistanceBetweenPoints: number;
  smoothingFn?: SmoothFunction;
}

/**
 * Applies smoothing to a path, returning a new
 * one with smoothing applied
 * @param p a sparse path of points, drawn
 * by raw mouse events
 * @param maxPointsToSmooth how many points the returned path
 * should be. The smaller the number, the farther behind the
 * user's drawn path will lag behind, assuming this function
 * is called per frame
 */
export function applySmoothing({
  path,
  maxPointsToSmooth,
  minDistanceBetweenPoints,
  smoothingFn,
}: SmoothingOptions): Path {
  requires(maxPointsToSmooth >= 3);


  return bezierSmoothing(path, maxPointsToSmooth, minDistanceBetweenPoints);
}

function bezierSmoothing(
  path: Path,
  maxPointsToSmooth: number,
  minDistanceBetweenPoints: number
): Path {

  const newPath: Path = [];

  /**
   * Draw it out on paper. You have 3 points, and you interpolate the first 2.
   * The min distance param influences you -- on the first 2 points, you draw
   * a point at the start and another 70% of the way to the 2nd point. Now, you'd
   * expect the third point (when we start interpolating 2 and 3) to be another
   * min distance apart from each other. BUT NO! Because the next point will be
   * at the START of that path (point 2) creating a discrepency. This is because
   * it has no memory of how far along it was in the previous path -- it only
   * has a local view of its distance traveled. We rectify this by storing the
   * distance the LAST point in the PREVIOUS interpolation was to the end
   */
  let prevDistanceToEndOfPath = 0;
  let index = 0;

  while (index < path.length) {
    //assert(prevDistanceToEndOfPath <= minDistanceBetweenPoints);

    const pathLengthToSmooth = Math.min(
      MAX_BEZIER_INTERPOLATIONS,
      path.length - index
    );

    //can't interporlate 1 point
    if (pathLengthToSmooth == 1) {
      newPath.push(path[index]);
      break;
    }

    const start = path[index];
    const end = path[index + pathLengthToSmooth - 1];
    console.log(start.toString() + ' ' + end.toString())

    // move forward by any distance remaining from the last part
    const offset = distanceAlong(start, end, prevDistanceToEndOfPath);
    console.log(offset)
    add(start, offset);

    const pathArr = [];
    for (let i = 0; i < pathLengthToSmooth; i++) pathArr.push(path[index + i]);

    const normalLineDistance = distance(start, end);
    const numPointsOnLine = Math.floor(
      normalLineDistance / minDistanceBetweenPoints
    );

    for (let i = 0; i < numPointsOnLine; i++) {
      const t = (minDistanceBetweenPoints * i) / normalLineDistance;
      console.log(t)
      newPath.push(NBezier(pathArr, t));
      //newPath.push(distanceAlong(start, end, i * minDistanceBetweenPoints))

      if (newPath.length == maxPointsToSmooth) return newPath;
    }

    if (numPointsOnLine > 0)
        prevDistanceToEndOfPath = distance(newPath[newPath.length - 1], end);

    index += pathLengthToSmooth - 1;
  }
  path.forEach(v => console.log(v.toString()))
  console.log(`old ${path.length} new ${newPath.length}`)
  return newPath;
}

export function NMidpoints(path: Path, midpointPower: number): Path {
  requires(0 < midpointPower && midpointPower <= 5);

  let numMidpoints = Math.pow(2, midpointPower);
  numMidpoints = Math.min(path.length, numMidpoints);

  if (numMidpoints == 0)
    return [];

  const desiredDistances = new Array(numMidpoints) as number[];

  const totalDistance = distanceAlongPath(path);
  const deltaDistance = totalDistance / numMidpoints;
  alert( totalDistance)

  for (let i = 0; i < numMidpoints; i++)
    desiredDistances[i] = i * deltaDistance;

  const res = pointsAtDistances(path, desiredDistances);
  return res ? res : path ;
}

function pointsAtDistances(path: Path, desiredDistances: number[]): Path {
  const newPath = [];
  let currentDistanceIdx = 0;

  let accumulatedDistance = 0;
  for (
    let i = 0;
    i < path.length - 1 && currentDistanceIdx < desiredDistances.length;
    i++
  ) {
    const start = path[i];
    const end = path[i + 1];

    const lineDistance = distance(start, end);
    const nextDistance = accumulatedDistance + lineDistance;

    //if multiple distances lie within these two points
    let d = desiredDistances[currentDistanceIdx];
    while (accumulatedDistance <= d && d <= nextDistance) {
      const scaled = d - accumulatedDistance;
      const t = scaled / lineDistance;

      const offset = distanceAlong(start, end, t);
      newPath.push(add(copy(start), offset));

      if (currentDistanceIdx++ == desiredDistances.length) return newPath;

      d = desiredDistances[currentDistanceIdx];
    }

    accumulatedDistance = nextDistance;
  }

  return newPath;
}

function distanceAlongPath(path: Path): number {
  let accumulatedDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    accumulatedDistance += distance(path[i], path[i + 1]);
  }
  return accumulatedDistance;
}


function factorial(n: number): number {
  requires(n >= 0);
  let base = 1;

  for (let i = 2; i <= n; i++) base *= i;

  return base;
}

function combinations(n: number, i: number): number {
  requires(i <= n);
  const nfac = factorial(n);
  const ifac = factorial(i);
  const nMinusIFac = factorial(n - i);
  return nfac / (ifac * nMinusIFac);
}

function NBezier(path: Path, t: number): Float32Vector2 {
  requires(0 <= t && t <= 1);

  const n = path.length - 1;
  const point = new Float32Vector2(0, 0);

  for (let i = 0; i <= n; i++) {
    const coef1 = combinations(n, i); //TODO memoization
    const coef2 = Math.pow(t, i);
    const coef3 = Math.pow(1 - t, n - i);
    const mult = coef1 * coef2 * coef3;
    add(point, scale(copy(path[i]), mult))
  }

  return point;
}
