import type Stabilizer from "./stabilizer";
import { type Point } from "../../tools/brush";
import { assert } from "~/utils/contracts";
import { add, copy, scale, sub } from "~/utils/web/vector";
import { normalize } from '../../../web/vector';
import { type BrushSettings } from "../../tools/settings";

export default class UnitStabilizer implements Stabilizer {
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
        return this.currentPoints
    }

    getProcessedCurveWithPoints(points: Point[], spacing: number): Point[] {
        return points
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
