import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { type BlendingOptions } from './blending';

export interface OverlayLayer {
  framebuffer: FrameBuffer;
  blendingOptions: BlendingOptions;
}
