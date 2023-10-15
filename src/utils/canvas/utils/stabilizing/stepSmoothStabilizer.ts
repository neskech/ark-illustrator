import type Stabilizer from "./stabilizer";
import { type Point } from "../../tools/brush";
import { assert } from "~/utils/contracts";
import { type BrushSettings } from "../../tools/settings";
import { CurveInterpolator } from "curve-interpolator";
import { Float32Vector2 } from "matrixgl";
import { todo } from "~/utils/func/funUtils";

export default class StepSmoothStabilizer implements Stabilizer {
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
        const processed = addPointsCartmollInterpolation(this.currentPoints, 1.0, 1.0, 0.5)

        this.assertValid()

        return processed
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

function cartmullRom(t: number, points: Point[]): Point {
    return todo()
}

function addPointsCartmollInterpolation(rawCurve: Point[], tension: number, alpha: number, spacing: number): Point[] {
    if (rawCurve.length <= 1)
        return rawCurve

    const points = rawCurve.map(p => [p.x, p.y])
    const interpolator = new CurveInterpolator(points, {
        tension,
        alpha
    })

    const curveDist = interpolator.getLengthAt(1)
    const numSteps = Math.ceil(curveDist / spacing)
    console.log(curveDist, numSteps, spacing)

    const output: Point[] = []
    for (let i = 0; i < numSteps; i++) {
        const parameter = Math.max(1, (spacing * i) / curveDist)
        console.log(`Index ${i} with param ${parameter} and curve dist ${curveDist} and num steps ${numSteps}`)
        const point = interpolator.getPointAt(parameter)
        output.push(new Float32Vector2(point[0], point[1]))
    }

    return output
}
