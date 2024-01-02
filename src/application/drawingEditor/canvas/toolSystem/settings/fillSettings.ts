export interface FillSettings {
  tolerance: number;
}

export function defaultFillSettings(): FillSettings {
    return {
        tolerance: 0
    }
}