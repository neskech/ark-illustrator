import { getDefaultBrushConfig, type BrushConfiguration } from './settings/brushConfig';
import { defaultFillSettings, type FillSettings } from './settings/fillSettings';
import SettingsPreset from './settings/settingsPreset';

export interface AllToolSettings {
  readonly brushConfigurations: SettingsPreset<BrushConfiguration>;
  readonly fillSettings: FillSettings;
}

export async function getDefaultSettings(): Promise<AllToolSettings> {
  return {
    brushConfigurations: new SettingsPreset(3, await getDefaultBrushConfig()),
    fillSettings: defaultFillSettings(),
  };
}
