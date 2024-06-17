import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/drawingEditor/webgl/vertexAttributes';
import CanvasRenderModule, { type CanvasRenderModuleArgs } from '../canvasRenderModule';
import Buffer from '~/drawingEditor/webgl/buffer';
import { VertexArrayObject } from '~/drawingEditor/webgl/vertexArray';
import { QuadilateralFactory } from '../../geometry/quadFactory';
import type Shader from '~/drawingEditor/webgl/shader';
import { QuadTransform } from '../../geometry/transform';
import { QuadPositioner } from '../../geometry/positioner';
import { QuadRotator } from '../../geometry/rotator';
import EventManager from '~/util/eventSystem/eventManager';
import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import { type Float32Vector2, Float32Vector3 } from 'matrixgl';
import { midpoint } from '~/drawingEditor/webgl/vector';
import { clearFramebuffer } from '../../util';

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

type SquareModuleArgs = CanvasRenderModuleArgs;

export default class RectangleModule extends CanvasRenderModule {
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;

  constructor(args: SquareModuleArgs) {
    super(args);
    this.vertexArray = new VertexArrayObject(this.gl, vertexAttributes);
    this.vertexBuffer = new Buffer(this.gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = args.assetManager.getShader('square');
    this.initBuffer();
    this.setupEvents();
  }

  private initBuffer() {
    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);

    this.vertexArray.applyAttributes(this.gl);
    const quadBuffer = new Float32Array(NUM_VERTEX_QUAD * SIZE_VERTEX);
    this.vertexBuffer.allocateWithData(this.gl, quadBuffer);

    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
  }

  private renderRectangle(framebuffer: FrameBuffer, anchor: Float32Vector2, other: Float32Vector2) {
    framebuffer.bind(this.gl);
    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);
    this.shader.use(this.gl);

    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    this.shader.uploadFloatVec3(this.gl, 'color', new Float32Vector3(1, 0, 0));

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
    this.vertexBuffer.addData(this.gl, buf);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.shader.stopUsing(this.gl);
    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
    framebuffer.unBind(this.gl);
  }

  private setupEvents() {
    EventManager.subscribe('rectangleContinued', ({ anchorPosition, otherPosition }) => {
      console.log('YEAHN NIGGEr');
      clearFramebuffer(this.gl, this.canvasOverlayFramebuffer, 1, 1, 1, 1);
      this.overlayRenderer.renderCanvasToOverlay(
        this.canvasFramebuffer,
        this.canvasOverlayFramebuffer
      );
      this.renderRectangle(this.canvasOverlayFramebuffer, anchorPosition, otherPosition);
      this.isOverlayFramebufferIsEmpty(false);
    });

    EventManager.subscribe('rectangleFinished', ({ anchorPosition, otherPosition }) => {
      this.renderRectangle(this.canvasFramebuffer, anchorPosition, otherPosition);
      clearFramebuffer(this.gl, this.canvasOverlayFramebuffer, 1, 1, 1, 1);
      this.isOverlayFramebufferIsEmpty(true);
    });

    EventManager.subscribe('rectangleCanceled', () => {
      clearFramebuffer(this.gl, this.canvasOverlayFramebuffer, 1, 1, 1, 1);
      this.isOverlayFramebufferIsEmpty(true);
    });
  }
}
