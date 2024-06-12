import { type GL } from '~/drawingEditor/webgl/glUtils';
import { BrushSettings } from './settings/brushSettings';
import { defaultFillSettings, type FillSettings } from './settings/fillSettings';
import SettingsPreset from './settingsPreset';

export interface GlobalToolSettings {
  brushSettings: SettingsPreset<BrushSettings>;
  fillSettings: FillSettings;
}

export function getDefaultSettings(gl: GL): GlobalToolSettings {
  return {
    brushSettings: new SettingsPreset(3, BrushSettings.default(gl)),
    fillSettings: defaultFillSettings(),
  };
}
