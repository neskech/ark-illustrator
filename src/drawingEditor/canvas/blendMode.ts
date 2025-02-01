export type BlendMode = 'Normal' | 'Overwrite' | 'Multiply'

const blendModeMap = {
    Normal: 0,
    Overwrite: 1,
    Multiply: 2
}

export class BlendModeUtils {
    public static blendModeToInt(mode: BlendMode): number {
        return blendModeMap[mode]
    }
}


