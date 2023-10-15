import { type BrushPoint, type BrushSettings } from '../../tools/brush';

export default interface Stabilizer {
    addPoint: (p: BrushPoint) => void,
    getProcessedCurve: (settings: Readonly<BrushSettings>) => BrushPoint[]
    getRawCurve: (settings: Readonly<BrushSettings>) => BrushPoint[]
    reset: () => void
}

export const BRUSH_SIZE_SPACING_FACTOR = 1/2

export const getSpacingFromBrushSize = (brushSize: number): number => {
    return brushSize * BRUSH_SIZE_SPACING_FACTOR
}

export const getSpacingFromBrushSettings = (settings: Readonly<BrushSettings>): number => {
    return settings.spacing == 'auto' ? getSpacingFromBrushSize(settings.size) : settings.spacing
}