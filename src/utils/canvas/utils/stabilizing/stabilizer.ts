import { type Point } from "../../tools/brush";
import { type BrushSettings } from "../../tools/settings";

export default interface Stabilizer {
    addPoint: (p: Point) => void,
    getProcessedCurve: (settings: Readonly<BrushSettings>) => Point[]
    getRawCurve: (settings: Readonly<BrushSettings>) => Point[]
    reset: () => void
}

export const BRUSH_SIZE_SPACING_FACTOR = 1/2

export const getSpacingFromBrushSize = (brushSize: number): number => {
    return brushSize * BRUSH_SIZE_SPACING_FACTOR
}

export const getSpacingFromBrushSettings = (settings: Readonly<BrushSettings>): number => {
    return settings.spacing == 'auto' ? getSpacingFromBrushSize(settings.size) : settings.spacing
}