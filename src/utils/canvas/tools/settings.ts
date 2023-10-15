import { type BrushSettings, defaultBrushSettings } from "./brush";


export interface FillSettings {
  tolerance: number;
}

export interface GlobalToolSettings {
  brushSettings: [BrushSettings, BrushSettings, BrushSettings];
  fillSettings: FillSettings;
}

export function getDefaultSettings(): GlobalToolSettings {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
