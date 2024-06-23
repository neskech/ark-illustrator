import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/util/webglWrapper/vertexAttributes';
import Buffer from '~/util/webglWrapper/buffer';
import { VertexArrayObject } from '~/util/webglWrapper/vertexArray';
import type Shader from '~/util/webglWrapper/shader';
import EventManager from '~/util/eventSystem/eventManager';
import type FrameBuffer from '~/util/webglWrapper/frameBuffer';
import { type Float32Vector2, Float32Vector3 } from 'matrixgl';
import { midpoint } from '~/util/webglWrapper/vector';
import type AssetManager from '../util/assetManager';
import type OverlayRenderer from '../utilityRenderers.ts/overlayRenderer';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import { clearFramebuffer } from '../util/util';
import { gl } from '~/drawingEditor/application';
import { QuadilateralFactory } from '../geometry/quadFactory';
import type UtilityRenderers from '../utilityRenderers.ts/utilityRenderers';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const SIZE_VERTEX = 2;
const NUM_VERTEX_QUAD = 6;
const NUM_ELEMENTS_QUAD = SIZE_VERTEX * NUM_VERTEX_QUAD;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const vertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
});
type AttribsType = GetAttributesType<typeof vertexAttributes>;

type SquareRendererArgs = {
  assetManager: AssetManager;
  canvasFramebuffer: FrameBuffer;
  canvasOverlayFramebuffer: FrameBuffer;
  utilityRenderers: UtilityRenderers;
};

export default class RectangleToolRenderer {
  private canvasFramebuffer: FrameBuffer;
  private canvasOverlayFramebuffer: FrameBuffer;
  private assetManager: AssetManager;
  private overlayRenderer: OverlayRenderer;
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;
  private color: Float32Vector3;

  constructor(args: SquareRendererArgs) {
    this.canvasFramebuffer = args.canvasFramebuffer;
    this.canvasOverlayFramebuffer = args.canvasOverlayFramebuffer;
    this.assetManager = args.assetManager;
    this.overlayRenderer = args.utilityRenderers.getOverlayRenderer();

    this.vertexArray = new VertexArrayObject(vertexAttributes);
    this.vertexBuffer = new Buffer({
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = this.assetManager.getShader('rectangle');
    this.color = new Float32Vector3(0, 0, 0);
    this.initBuffer();
  }

  private initBuffer() {
    this.vertexArray.bind();
    this.vertexBuffer.bind();

    this.vertexArray.applyAttributes();
    const quadBuffer = new Float32Array(NUM_VERTEX_QUAD * SIZE_VERTEX);
    this.vertexBuffer.allocateWithData(quadBuffer);

    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
  }

  public renderRectangleContinued(anchorPosition: Float32Vector2, otherPosition: Float32Vector2) {
    clearFramebuffer(this.canvasOverlayFramebuffer, 1, 1, 1, 1);
    this.overlayRenderer.renderCanvasToOverlay(
      this.canvasFramebuffer,
      this.canvasOverlayFramebuffer
    );
    this.renderRectangle(this.canvasOverlayFramebuffer, anchorPosition, otherPosition);
  }

  public renderRectangleFinished(anchorPosition: Float32Vector2, otherPosition: Float32Vector2) {
    this.renderRectangle(this.canvasFramebuffer, anchorPosition, otherPosition);
    clearFramebuffer(this.canvasOverlayFramebuffer, 1, 1, 1, 1);
  }
  public renderRectangleCancled() {
    clearFramebuffer(this.canvasOverlayFramebuffer, 1, 1, 1, 1);
  }

  private renderRectangle(framebuffer: FrameBuffer, anchor: Float32Vector2, other: Float32Vector2) {
    framebuffer.bind();
    this.vertexArray.bind();
    this.vertexBuffer.bind();
    this.shader.bind();

    gl.blendFunc(gl.ONE, gl.ZERO);

    this.shader.uploadFloatVec3('color', this.color);

    const buf = new Float32Array(NUM_ELEMENTS_QUAD);
    this.quadFactory.emplaceRectangle({
      buffer: buf,
      offset: 0,
      transform: QuadTransform.builder()
        .position(QuadPositioner.center(midpoint(anchor, other)))
        .rotate(QuadRotator.identity())
        .build(),
      attributes: {},
      width: Math.abs(anchor.x - other.x),
      height: Math.abs(anchor.y - other.y),
    });
    this.vertexBuffer.addData(buf);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.shader.unBind();
    this.vertexArray.unBind();
    this.vertexBuffer.unBind();
    framebuffer.unBind();
  }

  private setupEvents() {
    EventManager.subscribe('colorChanged', (color) => {
      console.log('YEAHHHHH');
      this.color = color;
    });
  }
}
