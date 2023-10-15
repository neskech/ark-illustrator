import { type Point } from "../../tools/brush";
import { type BrushSettings } from "../../tools/settings";

export default interface Stabilizer {
    addPoint: (p: Point) => void,
    getProcessedCurve: (settings: Readonly<BrushSettings>) => Point[]
    getRawCurve: (settings: Readonly<BrushSettings>) => Point[]
    reset: () => void
}