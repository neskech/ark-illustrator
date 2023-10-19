import { MAX_POINTS_PER_FRAME } from '~/utils/pipelines/strokePipeline';
import { type BrushPoint, type BrushSettings } from '../../tools/brush';
import { assert, requires } from '~/utils/contracts';

export default interface Stabilizer {
    addPoint: (p: BrushPoint, settings: Readonly<BrushSettings>) => void,
    getProcessedCurve: (settings: Readonly<BrushSettings>) => BrushPoint[]
    getRawCurve: (settings: Readonly<BrushSettings>) => BrushPoint[]
    reset: () => void
}

export const BRUSH_SIZE_SPACING_FACTOR = (settings: Readonly<BrushSettings>) => getSpacingFromBrushSettings(settings) / (settings.size * settings.maxSize)
export const MAX_SIZE_RAW_BRUSH_POINT_ARRAY = (settings: Readonly<BrushSettings>) => Math.floor(MAX_POINTS_PER_FRAME * BRUSH_SIZE_SPACING_FACTOR(settings))

export const getSpacingFromBrushSettings = (settings: Readonly<BrushSettings>): number => {
    return settings.spacing == 'auto' ? settings.size * 0.5 : settings.spacing
}

export function getNumDeletedElementsFromDeleteFactor(deleteFactor: number, maxSize: number): number {
    return Math.floor(maxSize * deleteFactor)
}

export function shiftDeleteElements<A>(array: A[], deleteFactor: number, maxSize: number) {
    requires(array.length == maxSize)

    const numToShaveOff = Math.floor(maxSize * deleteFactor)
   /// assert(numToShaveOff < maxSize)

    const remaining = maxSize - numToShaveOff

    for (let i = 0; i < remaining; i++) {
        array[i] = array[i + numToShaveOff]
    }

}