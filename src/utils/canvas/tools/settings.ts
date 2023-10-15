export interface BrushSettings {
  size: number;
  opacity: number;
  stabilization: number;
  spacing: 'auto' | number;
  
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
        stabilization: 0.5,
        spacing: 0.005
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
