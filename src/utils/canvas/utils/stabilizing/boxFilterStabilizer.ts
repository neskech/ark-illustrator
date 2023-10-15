import type Stabilizer from "./stabilizer";
import { type Point } from "../../tools/brush";
import { assert } from "~/utils/contracts";
import { add, copy, scale, sub } from "~/utils/web/vector";
import { normalize } from '../../../web/vector';
import { type BrushSettings } from "../../tools/settings";
import { Float32Vector2 } from "matrixgl";
import { todo } from "~/utils/func/funUtils";
import { CurveInterpolator } from "curve-interpolator";

export default class BoxFilterStabilizer implements Stabilizer {
    private currentPoints: Point[]
    private cachedCurve: Point[]

    constructor() {
        this.currentPoints = []
        this.cachedCurve = []
    }

    addPoint(p: Point) {
       this.currentPoints.push(p)
    }

    getProcessedCurve(_: Readonly<BrushSettings>): Point[] {
        //const processed = addPointsLinearInterpolation(this.currentPoints, 0.005)
        const processed = boxFilter(this.currentPoints, 1)
        this.assertValid()

        return processed
    }

    getProcessedCurveWithPoints(points: Point[], spacing: number): Point[] {
        return process(points)
    }

    getRawCurve(): Point[] {
        return this.currentPoints
    }

    reset() {
        this.currentPoints = []
        this.cachedCurve = [] 
    }
    
    private assertValid() {
        assert(true)
    }
}

function process(curve: Point[]): Point[] {
    if (curve.length <= 2)
        return curve

    //const weighted = addEndpoints(curve, 10)
    const weighted = curve

    // eslint-disable-next-line prefer-const
    let boxed = weighted
    for (let i = 0; i < 3; i++) {
        boxed = boxFilterExpwa(boxed, 5, 10, 10)
        boxed = smoothEndpoints(boxed, curve[0], boxed[boxed.length - 1])
    }

    return addPointsCartmollInterpolation(boxed, 0.0, 1.0, 0.005)
}

function boxFilter(curve: Point[], radius: number): Point[] {
    if (curve.length <= 1)
        return curve

    function clamp(n: number, min: number, max: number) {
        return Math.min(max, Math.max(n, min))
    } 

    const denominator = 1 / (2 * radius + 1)

    const newPoints = []
    for (let i = 0; i < curve.length - 1; i++) {
        const p1 = curve[i]

        const avg = copy(p1)
        for (let r = 1; r < radius; r++) {
            const left = curve[clamp(i - r, 0, curve.length - 1)]
            const right = curve[clamp(i + r, 0, curve.length - 1)]
            add(avg, left)
            add(avg, right)
        }
        scale(avg, denominator)
        newPoints.push(avg)
    }

    return newPoints
}

function boxFilterExpwa(curve: Point[], radius: number, decayFactor: number, distFromEnd: number): Point[] {
    if (curve.length <= 1)
        return curve

    let denom = 1
    for (let i = 1; i <= radius; i++) {
        denom += 2 * Math.exp(-i * decayFactor)
    }

    function calcFactorExp(i: number, d: number, k: number, r: number) {
        const decay = ((distFromEnd - i) / distFromEnd)
        const rrdd = decay * decay * decay * decay

        let denom = 1
        for (let d = 1; d <= r; d++) {
            denom += 2 * Math.exp(-d * k * rrdd)
        }

        const numerator = Math.exp(-d * k * rrdd)
        return numerator / denom
    }

    function clamp(n: number, min: number, max: number) {
        return Math.min(max, Math.max(n, min))
    } 

    const denominator = 1 / (2 * radius + 1)

    function factor(n: number, r: number): number {
        const dist = Math.min(n, curve.length - 1 - n)
        if (dist <= distFromEnd) {
            return calcFactorExp(dist, r, decayFactor, radius)
            //return Math.exp(-r * decayFactor) / denom
        }
        return denominator
    }

    const newPoints = []
    for (let i = 0; i < curve.length - 1; i++) {
        const p1 = curve[i]


        const avg = scale(copy(p1), factor(i, 0))
        let weights = factor(i, 0)
        for (let r = 1; r <= radius; r++) {
            const lIdx = clamp(i - r, 0, curve.length - 1)
            const rIdx = clamp(i + r, 0, curve.length - 1)

            const left = scale(copy(curve[lIdx]), factor(i, r))
            const right = scale(copy(curve[rIdx]), factor(i, r))
            weights += factor(i, r) + factor(i, r)

            add(avg, left)
            add(avg, right)
        }
 
        newPoints.push(avg)
    }

    return newPoints
}

function addEndpoints(curve: Point[], numToAdd: number): Point[] {
    const results = []
    for (let i = 0; i < curve.length - 1; i++) {
        const p0 = i > 0 ? curve[i - 1] : curve[i]
        const p1 = curve[i]
        const p2 = curve[i + 1]
        const p3 = i < curve.length - 2 ? curve[i + 2] : curve[i + 1]

        const distToStart = Math.floor(i / 3)
        const distToEnd = Math.floor((curve.length - 1 - i) / 3)
        const distToEndpoint = Math.min(distToStart, distToEnd)
        const samples = Math.max(0, Math.max(5 - distToStart, 5 - distToEnd))

        if (samples > 0) {
            results.push(...carmullRom2D(p0, p1, p2, p3, samples))
        }
        results.push(copy(p2))
    }
    return results
}

function addEndpoints2(curve: Point[], numToAdd: number): Point[] {
    const newShit = [...curve]
    if (curve.length >= 3) {
        // const start = carmullRom2D(newShit[0], newShit[0], newShit[1], newShit[2], numToAdd)
        // newShit.splice(1, 2)
        // newShit.splice(1, 0, ...start)
        
        const endIdx = curve.length - 3
        const end = carmullRom2D(newShit[endIdx], newShit[endIdx + 1], newShit[endIdx + 2], newShit[endIdx + 2], numToAdd)
        newShit.splice(endIdx + 1, 2)
        newShit.splice(endIdx + 1, 0, ...end)
    }
    return newShit
}

function smoothEndpoints(boxedCurve: Point[], ogStart: Point, ogEnd: Point): Point[] {
    //const newPoints = [ogStart].concat(boxedCurve).concat([ogEnd])
    const newPoints = [...boxedCurve, copy(ogEnd)]

    if (newPoints.length >= 3) {
        const start = carmullRom2D(newPoints[0], newPoints[0], newPoints[1], newPoints[2], 10)
        //newPoints.splice(1, 2)
        newPoints.splice(1, 0, ...start)
        
        const endIdx = newPoints.length - 3
        const end = carmullRom2D(newPoints[endIdx], newPoints[endIdx + 1], newPoints[endIdx + 2], newPoints[endIdx + 2], 10)
        //newPoints.splice(endIdx + 1, 2)
        //newPoints.splice(endIdx + 1, 0, ...end)
        newPoints.push(...end)
    }

    return newPoints
}

function addPointsLinearInterpolation(rawCurve: Point[], spacing: number): Point[] {
    if (rawCurve.length <= 1)
        return rawCurve

    const newPoints = []
    for (let i = 0; i < rawCurve.length - 1; i++) {
        const start = rawCurve[i]
        const end = rawCurve[i + 1]

        const displacement = sub(copy(end), start)
        const distance = displacement.magnitude
        const direction = normalize(displacement)
        const numPointsAlong = Math.ceil(distance / spacing)

        newPoints.push(start)
        for (let j = 0; j < numPointsAlong - 1; j++) {
            const dist = spacing * (j + 1)
            const along = add(scale(copy(direction), dist), start) 
            newPoints.push(along)
        }
        newPoints.push(end)
        
    }

    return newPoints
}

function cartmullRom1D(f1: number, f2: number, f3: number, f4: number): [number, number, number, number] {
    const p1 = f1
    const p2 = (-f1 + f3) * 0.5
    const p3 = f1 - 2.5 * f2 + 2 * f3 - 0.5 * f4
    const p4 = -0.5 * f1 + 1.5 * f2 - 1.5 * f3 + 0.5 * f4
    return [p1, p2, p3, p4]
}

function carmullRom2D(p1: Point, p2: Point, p3: Point, p4: Point, samples: number): Point[] {
    const [x1, x2, x3, x4] = cartmullRom1D(p1.x, p2.x, p3.x, p4.x)
    const [y1, y2, y3, y4] = cartmullRom1D(p1.y, p2.y, p3.y, p4.y)

    const results = []
    for (let i = 0; i < samples; i++) {
        const t = (i + 1) / (samples + 1)
        const t2 = t * t
        const t3 = t2 * t
        const pos = new Float32Vector2(x1 + x2 * t + x3 * t2 + x4 * t3, y1 + y2 * t + y3 * t2 + y4 * t3)
        results.push(pos)
    }
    return results
}

function addPointsCartmollInterpolation(
    rawCurve: Point[],
    tension: number,
    alpha: number,
    spacing: number
  ): Point[] {
    if (rawCurve.length <= 1) return rawCurve;
  
    const points = rawCurve.map((p) => [p.x, p.y]);
    const interpolator = new CurveInterpolator(points, {
      tension,
      alpha,
    });
  
    const curveDist = interpolator.getLengthAt(1);
    const numSteps = Math.ceil(curveDist / spacing);
  
    const output: Point[] = [];
    for (let i = 0; i < numSteps; i++) {
      const parameter = Math.min(1, (spacing * i) / curveDist);
      const point = interpolator.getPointAt(parameter);
      output.push(new Float32Vector2(point[0], point[1]));
    }
  
    return output;
  }