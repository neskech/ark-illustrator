import { unreachable } from '~/util/general/funUtils';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import { type Interpolator } from './interpolator';
import { LinearInterpolator, type LinearInterpolatorSettings } from './linearInterpolator';
import { SmoothedInterpolator, type SmoothedInterpolatorSettings } from './smoothedInterpolator';

export type InterpolatorSettings = SmoothedInterpolatorSettings | LinearInterpolatorSettings;

export default class InterpolatorFactory {
  public static getInterpolatorOfAppropiateType(
    settings: InterpolatorSettings,
    _: BaseBrushSettings
  ): Interpolator {
    switch (settings.type) {
      case 'smoothed':
        return new SmoothedInterpolator(settings);
      case 'linear':
        return new LinearInterpolator(settings);
      default:
        return unreachable();
    }
  }
}

export function getDefaultInterpolatorSettings(): InterpolatorSettings {
  return { type: 'linear', spacing: 0.5 };
}
