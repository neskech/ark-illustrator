import { requires } from '~/util/general/contracts';

export default class SettingsPreset<T> {
  private numPresets: number;
  private currentPreset: number;
  private presets: T[];

  constructor(numPresets: number, defaultPreset: T) {
    requires(numPresets > 1, 'preset group must have atleast two presets');
    this.numPresets = numPresets;
    this.presets = Array.fillWith(numPresets, defaultPreset);
    this.currentPreset = 0;
  }

  getCurrentPreset(): T {
    return this.presets[this.currentPreset];
  }

  getPresetIndex(): number {
    return this.currentPreset;
  }

  setCurrentPreset(presetNumber: number) {
    requires(0 < presetNumber && presetNumber < this.numPresets, 'preset number out of range');
    this.currentPreset = presetNumber;
  }

  switchToNextPreset() {
    this.currentPreset = (this.currentPreset + 1) % this.numPresets;
  }

  switchToPreviousPreset() {
    this.currentPreset = (this.currentPreset - 1) % this.numPresets;
  }
}
