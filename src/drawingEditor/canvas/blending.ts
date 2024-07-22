
export type BlendingMode = 'normal' | 'multiply' | 'linearBurn' | 'colorDodge'

export interface BlendingOptions {
    blendingMode: BlendingMode
    opacity: number
}