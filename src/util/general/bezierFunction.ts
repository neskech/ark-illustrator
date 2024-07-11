import { Vector2 } from 'matrixgl_fork';
import { assert, requires } from './contracts';

export default class BezierFunction {
  private controlPoints: Vector2[];

  constructor() {
    this.controlPoints = [];
  }

  addPoint(point: Vector2) {
    this.controlPoints.push(point);
    this.assertIsValid();
  }

  removePoint(point: number | Vector2) {
    if (typeof point == 'number') {
      requires(point >= 0 && point < this.controlPoints.length);
      this.controlPoints.splice(point, 1);
      return;
    }

    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      if (p.x == point.x && p.y == point.y) {
        this.controlPoints.splice(i, 1);
        return;
      }
    }

    assert(false);
  }

  sample(t: number) {
    requires(0 <= t && t <= 1);
    requires(this.controlPoints.length >= 2);

    const n = this.controlPoints.length;
    let sum = new Vector2(0, 0);
    for (let i = 0; i < n; i++) {
      const comb = combinations(n, i);
      const factor = pow(1 - t, n - i);
      const factor2 = pow(t, i);
      const p = this.controlPoints[i];
      sum = sum.add(p.mult(comb * factor * factor2));
    }

    return sum;
  }

  sampleY(t: number) {
    requires(0 <= t && t <= 1);
    requires(this.controlPoints.length >= 2);

    const n = this.controlPoints.length;
    let sum = new Vector2(0, 0);
    for (let i = 0; i < n; i++) {
      const comb = combinations(n, i);
      const factor = pow(1 - t, n - i);
      const factor2 = pow(t, i);
      const p = this.controlPoints[i];
      sum = sum.add(p.mult(comb * factor * factor2));
    }

    return sum.y;
  }

  sampleNPoints(n: number) {
    requires(n > 0);

    const stepSize = 1 / n;
    const iters = n + 1;

    const points = [];
    for (let iter = 0; iter < iters; iter++) {
      const t = iter * stepSize;
      points.push(this.sample(t));
    }

    return points;
  }

  assertIsValid() {
    assert(this.controlPoints.length > 0);

    for (const p of this.controlPoints) {
      assert(p.x <= 1.0 || p.x >= 0);
      assert(p.y <= 1.0 || p.y >= 0);
    }

    for (let i = 0; i < this.controlPoints.length - 1; i++) {
      const p1 = this.controlPoints[i];
      const p2 = this.controlPoints[i + 1];
      assert(p2.x > p1.x);
    }
  }

  static getLinearBezier(): BezierFunction {
    const fn = new BezierFunction();
    fn.addPoint(new Vector2(0, 0));
    fn.addPoint(new Vector2(1, 1));
    return fn;
  }
}

function factorial(n: number): number {
  let base = 1;
  for (let i = 2; i <= n; i++) {
    base *= i;
  }
  return base;
}

function combinations(n: number, k: number): number {
  const nFact = factorial(n);
  const kFact = factorial(k);
  const nMinusKFact = factorial(n - k);
  return nFact / (kFact * nMinusKFact);
}

function pow(n: number, k: number): number {
  if (k == 0) return 1;

  const nSqrt = pow(n, Math.floor(k / 2));

  if (k % 2 == 0) return nSqrt * nSqrt;
  return nSqrt * nSqrt * n;
}
