import { unreachable } from '~/util/general/funUtils';
import NothingStabilizer, { type NothingStabilizerSettings } from './nothingStabilizer';
import { type BrushPoint } from '../brushTool';
import SpringStabilizer, { type SpringStabilizerSettings } from './springStabilizer';
import { assert } from '~/util/general/contracts';
import { type BaseBrushSettings } from '../../../settings/brushSettings';
import BoxFilterStabilizer, { type BoxFilterStabilizerSettings } from './boxFilterStabilizer';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export type StabilizerSettings =
  | NothingStabilizerSettings
  | SpringStabilizerSettings
  | BoxFilterStabilizerSettings;
type StabilizerType = StabilizerSettings['type'];

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class Stabilizer {
  private stabilizerType: StabilizerType;

  constructor(stabilizerType: StabilizerType) {
    this.stabilizerType = stabilizerType;
    this.assertCorrectStabilizerType(stabilizerType);
  }

  public abstract addPoint(point: BrushPoint, brushSettings: BaseBrushSettings): void;
  public abstract getProcessedCurve(brushSettings: BaseBrushSettings): BrushPoint[];
  public abstract reset(): void;

  // Optiona override.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public update(deltaTime: number, brushSettings: BaseBrushSettings) {
    return;
  }

  public isOfType(stabilizerType: StabilizerType): boolean {
    return this.stabilizerType == stabilizerType;
  }

  public isBatchedStabilizer(): this is BatchedStabilizer {
    return this instanceof BatchedStabilizer;
  }

  public assertIsBatched(): asserts this is BatchedStabilizer {
    assert(this.isBatchedStabilizer());
  }

  public isIncrementalStabilizer(): this is IncrementalStabilizer {
    return this instanceof IncrementalStabilizer;
  }

  public assertIsIncremental(): asserts this is IncrementalStabilizer {
    assert(this.isIncrementalStabilizer());
  }

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

  private assertCorrectStabilizerType(stabilizerType: StabilizerType) {
    switch (stabilizerType) {
      case 'spring':
        assert(this instanceof SpringStabilizer);
      case 'nothing':
        assert(this instanceof NothingStabilizer);
      default:
        return unreachable();
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! SUB CLASSES
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export abstract class BatchedStabilizer extends Stabilizer {
  constructor(stabilizerType: StabilizerType) {
    super(stabilizerType);
  }

  abstract predictSizeOfOutput(): number;
  abstract partitionStroke(brushSettings: BaseBrushSettings, maxSizeStroke: number): BrushPoint[];
}

export abstract class IncrementalStabilizer extends Stabilizer {
  constructor(stabilizerType: StabilizerType) {
    super(stabilizerType);
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! EXPORTED HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export function getDefaultStabilizerSettings(): StabilizerSettings {
  return { type: 'spring', springConstant: 0.3, friction: 0.5 };
}
