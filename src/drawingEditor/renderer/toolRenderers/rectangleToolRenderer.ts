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
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import { clearFramebuffer } from '../util/renderUtils';
import { gl } from '~/drawingEditor/application';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { type RenderContext } from '../renderer';

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

type RectangleRendererContext = {
  anchorPosition: Float32Vector2;
  otherPosition: Float32Vector2;
} & RenderContext;

type RectangleRendererCanceledContext = RenderContext;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN CLASS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class RectangleToolRenderer {
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;
  private color: Float32Vector3;

  constructor(assetManager: AssetManager) {
    this.vertexArray = new VertexArrayObject(vertexAttributes);
    this.vertexBuffer = new Buffer({
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = assetManager.getShader('rectangle');
    this.color = new Float32Vector3(0, 0, 0);
    this.initBuffer();
    this.setupEvents()
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

  public renderRectangleContinued(context: RectangleRendererContext) {
    clearFramebuffer(context.overlayFramebuffer);
    this.renderRectangle(context.overlayFramebuffer, context.anchorPosition, context.otherPosition);
  }

  public renderRectangleFinished(context: RectangleRendererContext) {
    this.renderRectangle(
      context.layerManager.getCanvasFramebufferForMutation(),
      context.anchorPosition,
      context.otherPosition
    );
    clearFramebuffer(context.overlayFramebuffer);
  }

  public renderRectangleCancled(context: RectangleRendererCanceledContext) {
    clearFramebuffer(context.overlayFramebuffer);
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
      this.color = color;
    });
  }
}
