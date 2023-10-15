import type Stabilizer from "./stabilizer";
import { type Point } from "../../tools/brush";
import { assert } from "~/utils/contracts";
import { add, copy, scale, sub } from "~/utils/web/vector";
import { normalize } from '../../../web/vector';
import { type BrushSettings } from "../../tools/settings";

export default class LinearStabilizer implements Stabilizer {
    private currentPoints: Point[]

    constructor() {
        this.currentPoints = []
    }

    addPoint(p: Point) {
       this.currentPoints.push(p)
    }

    getProcessedCurve(_: Readonly<BrushSettings>): Point[] {
        const processed = addPointsLinearInterpolation(this.currentPoints, 0.005)

        this.assertValid()

        return processed
    }

    getProcessedCurveWithPoints(points: Point[], spacing: number): Point[] {
        return addPointsLinearInterpolation(points, spacing)
    }

    getRawCurve(): Point[] {
        return this.currentPoints
    }

    reset() {
        this.currentPoints = []
    }
    
    private assertValid() {
        assert(true)
    }
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