import { unreachable } from '~/util/general/funUtils';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import BoxFilterStabilizer, { type BoxFilterStabilizerSettings } from './boxFilterStabilizer';
import NothingStabilizer, { type NothingStabilizerSettings } from './nothingStabilizer';
import SpringStabilizer, { type SpringStabilizerSettings } from './springStabilizer';
import { type Stabilizer } from './stabilizer';
import { EMAStabilizer, type EMAStabilizerSettings } from './EMAStabilizer';
import {
  MovingAverageStabilizer,
  type MovingAverageStabilizerSettings,
} from './movingAverageStabilizer';

export type StabilizerSettings =
  | NothingStabilizerSettings
  | SpringStabilizerSettings
  | BoxFilterStabilizerSettings
  | MovingAverageStabilizerSettings
  | EMAStabilizerSettings;

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
      case 'movingAverage':
        return new MovingAverageStabilizer(settings, brushSettings);
      case 'exponentialMovingAverage':
        return new EMAStabilizer(settings, brushSettings);
      case 'nothing':
        return new NothingStabilizer(settings, brushSettings);
      default:
        return unreachable();
    }
  }

  public static default(): StabilizerSettings {
    return {
      type: 'exponentialMovingAverage',
      alpha: 0.7,
      interpolatorSettings: { type: 'smoothed', spacing: 0.0003, alpha: 0.2, tension: 0.5 },
    };
  }
}
