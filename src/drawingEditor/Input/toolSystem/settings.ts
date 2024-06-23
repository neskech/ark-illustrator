import { type GL } from '~/util/webglWrapper/glUtils';
import { BrushSettings } from './settings/brushSettings';
import { defaultFillSettings, type FillSettings } from './settings/fillSettings';
import SettingsPreset from './settings/settingsPreset';

export interface AllToolSettings {
  brushSettings: SettingsPreset<BrushSettings>;
  fillSettings: FillSettings;
}

export function getDefaultSettings(gl: GL): AllToolSettings {
  return {
    brushSettings: new SettingsPreset(3, BrushSettings.default(gl)),
    fillSettings: defaultFillSettings(),
  };
}
