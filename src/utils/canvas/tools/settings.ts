export interface BrushSettings {
  size: number;
  opacity: number;
  smoothing: number;
}

export interface FillSettings {
  tolerance: number;
}

export interface GlobalToolSettings {
  brushSettings: [BrushSettings, BrushSettings, BrushSettings];
  fillSettings: FillSettings;
}

function defaultBrushSettings(): BrushSettings {
    return {
        size: 10,
        opacity: 1.0,
        smoothing: 0.0
    }
} 

export function getDefaultSettings(): GlobalToolSettings {
  return {
    brushSettings: [
        defaultBrushSettings(),
        defaultBrushSettings(),
        defaultBrushSettings()
    ],
    fillSettings: {
        tolerance: 0.0
    }
  };
}
