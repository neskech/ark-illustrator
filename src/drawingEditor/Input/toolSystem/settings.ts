import { BrushSettings } from './settings/brushSettings';
import { defaultFillSettings, type FillSettings } from './settings/fillSettings';
import SettingsPreset from './settings/settingsPreset';

export interface AllToolSettings {
  readonly brushSettings: SettingsPreset<BrushSettings>;
  readonly fillSettings: FillSettings;
}

export function getDefaultSettings(): AllToolSettings {
  return {
    brushSettings: new SettingsPreset(3, BrushSettings.default()),
    fillSettings: defaultFillSettings(),
  };
}
