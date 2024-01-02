import { type GL } from '~/application/drawingEditor/webgl/glUtils';
import { type BrushSettings, defaultBrushSettings } from './brush';

export interface FillSettings {
  tolerance: number;
}

export interface GlobalToolSettings {
  brushSettings: [BrushSettings, BrushSettings, BrushSettings];
  fillSettings: FillSettings;
}

export function getDefaultSettings(gl: GL): GlobalToolSettings {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    brushSettings: [defaultBrushSettings(gl), defaultBrushSettings(gl), defaultBrushSettings(gl)],
    fillSettings: {
      tolerance: 0.0,
    },
  };
}
