import { unreachable } from '~/util/general/funUtils';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import BoxFilterStabilizer, { type BoxFilterStabilizerSettings } from './boxFilterStabilizer';
import NothingStabilizer, { type NothingStabilizerSettings } from './nothingStabilizer';
import SpringStabilizer, { type SpringStabilizerSettings } from './springStabilizer';
import { type Stabilizer } from './stabilizer';

export type StabilizerSettings =
  | NothingStabilizerSettings
  | SpringStabilizerSettings
  | BoxFilterStabilizerSettings;

export default class StabilizerFactory {
  public static getStabilizerOfAppropiateType(
    settings: StabilizerSettings,
    brushSettings: BaseBrushSettings
  ): Stabilizer {
    switch (settings.type) {
      case 'box':
        return new BoxFilterStabilizer(settings, brushSettings);
      case 'spring':
        return new SpringStabilizer(settings, brushSettings);
      case 'nothing':
        return new NothingStabilizer(settings, brushSettings);
      default:
        return unreachable();
    }
  }
}

export function getDefaultStabilizerSettings(): StabilizerSettings {
  return {
    type: 'spring',
    springConstant: 2.0,
    friction: 0.9,
    interpolatorSettings: { type: 'smoothed', spacing: 0.0007, alpha: 0.2, tension: 0.5 },
  };
}
