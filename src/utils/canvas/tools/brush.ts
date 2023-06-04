import { requires } from "../../contracts";
import { type Vec2F, vec2F } from "../../web/vector";
import { type NDArray } from "vectorious";
import { assert } from "../../contracts";
import { type CanvasEventHandler, type EventDispatcher, type Tool } from "./tool";
import { todo, todoEmpty } from "~/utils/func/funUtils";
import { type BrushSettings } from "./settings";

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! TYPE DEFINITIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Brush extends Tool<BrushSettings> {
  isMouseDown: boolean
}

interface SmoothingOptions {
  path: Path;
  maxPointsToSmooth: number;
  minDistanceBetweenPoints: number;
  smoothingFn?: SmoothFunction;
}

type Dispatch = EventDispatcher<BrushSettings>;
type Handler = CanvasEventHandler<BrushSettings>;

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! CONSTRUCTOR + CONCRETE FUNCTIONS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

const dispatcher: Dispatch = function (
  this: Brush,
  event,
  handler,
  state,
  settings,
  presetNumber,
) {

  //console.info(`Event handler called for brush tool with event of type ${event.type}`);

  const presetIndex = presetNumber.expect("Preset index should be defined for brush tool");
  assert(0 <= presetIndex && presetIndex < settings.brushSettings.length);
  const bSettings = settings.brushSettings[presetIndex];

  assert(() => areValidBrushSettings(bSettings));

  event.preventDefault();
  handler.bind(this)(event, state, bSettings);
};

const mouseMove: Handler = function (this: Brush, event, state, settings) {
  todoEmpty()
};

const mouseDown: Handler = function (this: Brush, event, state, settings) {
  if (this.isMouseDown)
    return;

  console.log('mouse down!!')
  this.isMouseDown = true;
  state.camera.translateZoom(0.01);
  todoEmpty()
};

const mouseUp: Handler = function (this: Brush, event, state, settings) {
  if (!this.isMouseDown)
    return;
    
  this.isMouseDown = false;
      todoEmpty()
};

export function createBrush(): Brush {
  return {
    isMouseDown: false,
    dispatchEvent: dispatcher,
    mousedown: mouseDown,
    mouseup: mouseUp,
    mousemove: mouseMove,
  };
}

////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//! HELPERS

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

type Path = Vec2F[];
type SmoothFunction = "Bezier" | "Bezier Spline" | "Idk";

const MAX_BEZIER_INTERPOLATIONS = 10;

function areValidBrushSettings(b: BrushSettings): boolean {
  return (
    0 <= b.opacity &&
    b.opacity <= 100 &&
    0 <= b.smoothing &&
    b.smoothing <= 100
  );
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
function applySmoothing({
  path,
  maxPointsToSmooth,
  minDistanceBetweenPoints,
  smoothingFn,
}: SmoothingOptions): Path {
  requires(maxPointsToSmooth >= 3);

  //can't apply smoothing on < 3 points
  if (path.length < 3) return path;

  const smoothingFunction = smoothingFn ?? "Bezier";

  return bezierSmoothing(path, maxPointsToSmooth, minDistanceBetweenPoints);
}

function bezierSmoothing(
  path: Path,
  maxPointsToSmooth: number,
  minDistanceBetweenPoints: number
): Path {
  const newPath = [];

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
    assert(prevDistanceToEndOfPath <= minDistanceBetweenPoints);

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

    // move forward by any distance remaining from the last part
    const dispVector = displacementVector(start, end);
    dispVector.val.normalize();
    scaleBy(dispVector, prevDistanceToEndOfPath);
    start.val.add(dispVector.val);

    const pathArr = [];
    for (let i = 0; i < pathLengthToSmooth; i++) pathArr.push(path[index + i]);

    const normalLineDistance = distance(start, end);
    const numPointsOnLine = Math.floor(
      normalLineDistance / minDistanceBetweenPoints
    );

    for (let i = 0; i < numPointsOnLine; i++) {
      const t = (minDistanceBetweenPoints * i) / normalLineDistance;
      newPath.push(NBezier(pathArr, t));

      if (newPath.length == maxPointsToSmooth) return newPath;
    }

    prevDistanceToEndOfPath = distance(newPath[newPath.length - 1], end);

    index += pathLengthToSmooth;
  }

  return newPath;
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

      const dispVector = displacementVector(start, end);
      dispVector.val.normalize();
      scaleBy(dispVector, t);
      const point = start.val.copy().add(dispVector.val);
      newPath.push(wrapToVec2f(point));

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

function distanceSqrd(v1: Vec2F, v2: Vec2F) {
  return v1.val.x * v2.val.x + v1.val.y * v2.val.y;
}

function scaleBy(v: Vec2F, scale: number): void {
  v.val.x *= scale;
  v.val.y *= scale;
}

function wrapToVec2f(v: NDArray): Vec2F {
  return { val: v, __type: "Vec2F" };
}

function displacementVector(from: Vec2F, to: Vec2F): Vec2F {
  return wrapToVec2f(to.val.copy().subtract(from.val));
}

function distance(v1: Vec2F, v2: Vec2F) {
  return Math.sqrt(v1.val.x * v2.val.x + v1.val.y * v2.val.y);
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

function NBezier(path: Path, t: number): Vec2F {
  requires(0 <= t && t <= 1);

  const n = path.length;
  const point = vec2F(0, 0);

  for (let i = 0; i < n; i++) {
    const coef1 = combinations(n, i); //TODO memoization
    const coef2 = Math.pow(t, i);
    const coef3 = Math.pow(1 - t, n - i);
    const mult = coef1 * coef2 * coef3;
    point.val.x += mult * path[i].val.x;
    point.val.y += mult * path[i].val.y;
  }

  return point;
}
