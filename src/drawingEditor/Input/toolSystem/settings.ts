import { getDefaultBrushConfig, type BrushConfiguration } from './settings/brushConfig';
import { defaultFillSettings, type FillSettings } from './settings/fillSettings';
import SettingsPreset from './settings/settingsPreset';

export interface AllToolSettings {
  readonly brushConfigurations: SettingsPreset<BrushConfiguration>;
  readonly fillSettings: FillSettings;
}

export function getDefaultSettings(): AllToolSettings {
  return {
    brushConfigurations: new SettingsPreset(3, getDefaultBrushConfig()),
    fillSettings: defaultFillSettings(),
  };
}
