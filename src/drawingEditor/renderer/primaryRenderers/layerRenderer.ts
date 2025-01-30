import FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { clearFramebuffer } from '../util/renderUtils';
import { type PrimaryRendererContext } from './primaryRenderers';

export default class LayerRenderer {
  /* 
    This framebuffer caches the result of the textures of every single 
    layer into one. When no layers are mutated, we can render the cache
    directly onto the overlay without any extra processing.
  */
  private cacheFramebuffer: FrameBuffer;

  constructor(canvas: HTMLCanvasElement) {
    this.cacheFramebuffer = new FrameBuffer({
      type: 'no texture',
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    clearFramebuffer(this.cacheFramebuffer, 1, 1, 1, 1);
  }

  public renderAndGetFinalFramebuffer(context: PrimaryRendererContext): FrameBuffer {
    const overlayRenderer = context.utilityRenderers.getOverlayRenderer();
    clearFramebuffer(this.cacheFramebuffer, 1, 1, 1, 1);

    if (context.layerManager.hasCurrentLayerBeenMutated() || true) {
      for (const layer of context.layerManager.getLayers()) {
        overlayRenderer.renderTextureOntoFramebuffer(layer.getTexture(), this.cacheFramebuffer);
      }
    }

    overlayRenderer.renderTextureOntoFramebuffer(
      context.overlayFramebuffer.getTextureAttachment(),
      this.cacheFramebuffer
    );

    return this.cacheFramebuffer;
  }
}
