import { requires } from "~/util/general/contracts";

export type BlendMode = 'Normal' | 'Overwrite' | 'Multiply';

const blendModeMap: Record<BlendMode, number> = {
  Normal: 0,
  Overwrite: 1,
  Multiply: 2,
};

export class BlendModeUtils {
  public static blendModeToInt(mode: BlendMode): number {
    return blendModeMap[mode];
  }

  private static assertsIsBlendMode(mode: string): asserts mode is BlendMode {
    const modes = Object.keys(blendModeMap)
    requires(modes.includes(mode))
  }

  public static stringToBlendMode(mode: string): BlendMode {
    this.assertsIsBlendMode(mode)
    return mode
  }
}
