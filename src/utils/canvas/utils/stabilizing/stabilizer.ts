import { MAX_POINTS_PER_FRAME } from '~/utils/pipelines/drawPipeline';
import { type BrushPoint, type BrushSettings } from '../../tools/brush';
import { assert, requires } from '~/utils/contracts';

export default interface Stabilizer {
    addPoint: (p: BrushPoint) => void,
    getProcessedCurve: (settings: Readonly<BrushSettings>) => BrushPoint[]
    getRawCurve: (settings: Readonly<BrushSettings>) => BrushPoint[]
    reset: () => void
}

export const BRUSH_SIZE_SPACING_FACTOR = 1/2
export const MAX_SIZE_RAW_BRUSH_POINT_ARRAY = MAX_POINTS_PER_FRAME * BRUSH_SIZE_SPACING_FACTOR

export const getSpacingFromBrushSize = (brushSize: number): number => {
    return brushSize * BRUSH_SIZE_SPACING_FACTOR
}

export const getSpacingFromBrushSettings = (settings: Readonly<BrushSettings>): number => {
    return settings.spacing == 'auto' ? getSpacingFromBrushSize(settings.size) : settings.spacing
}

export function shiftDeleteElements<A>(array: A[], deleteFactor: number): number {
    requires(array.length == MAX_SIZE_RAW_BRUSH_POINT_ARRAY)

    const numToShaveOff = Math.floor(MAX_SIZE_RAW_BRUSH_POINT_ARRAY * deleteFactor)
    assert(numToShaveOff < MAX_SIZE_RAW_BRUSH_POINT_ARRAY)

    const remaining = MAX_SIZE_RAW_BRUSH_POINT_ARRAY - numToShaveOff

    for (let i = 0; i < remaining; i++) {
        array[i] = array[i + numToShaveOff]
    }

    return numToShaveOff
}