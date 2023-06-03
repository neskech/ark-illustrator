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
