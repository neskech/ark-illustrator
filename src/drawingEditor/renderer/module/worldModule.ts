import type FrameBuffer from '~/drawingEditor/webgl/frameBuffer';
import WorldRenderModule, { type WorldRenderModuleArgs } from './worldRenderModule';
import { Float32Vector2 } from 'matrixgl';
import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/drawingEditor/webgl/vertexAttributes';
import type Shader from '~/drawingEditor/webgl/shader';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { VertexArrayObject } from '~/drawingEditor/webgl/vertexArray';
import type Camera from '~/drawingEditor/canvas/camera';
import Buffer from '~/drawingEditor/webgl/buffer';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';
import { clearScreen } from '../util';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const CANVAS_ORIGIN = new Float32Vector2(0, 0);
const SIZE_VERTEX = 4;
const NUM_VERTEX_QUAD = 6;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPE DEFINITIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

const vertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
  texCord: VertexAttributeType.floatList(2),
});

type AttribsType = GetAttributesType<typeof vertexAttributes>;

type WorldModuleArgs = { camera: Camera } & WorldRenderModuleArgs;
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class WorldModule extends WorldRenderModule {
  private vertexArray: VertexArrayObject<AttribsType>;
  private vertexBuffer: Buffer;
  private quadFactory: QuadilateralFactory<AttribsType>;
  private shader: Shader;
  private camera: Camera;

  constructor(args: WorldModuleArgs) {
    super(args);
    this.vertexArray = new VertexArrayObject(this.gl, vertexAttributes);
    this.vertexBuffer = new Buffer(this.gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = args.assetManager.getShader('world');
    this.camera = args.camera;

    this.initBuffer();
  }

  private initBuffer() {
    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);

    this.vertexArray.applyAttributes(this.gl);
    const aspectRatio = this.camera.getAspRatio();
    const quadBuffer = new Float32Array(NUM_VERTEX_QUAD * SIZE_VERTEX);

    this.quadFactory.emplaceRectangle({
      transform: QuadTransform.builder()
        .position(QuadPositioner.center(CANVAS_ORIGIN))
        .rotate(QuadRotator.identity())
        .build(),
      width: aspectRatio,
      height: 1,
      attributes: {
        bottomLeft: {
          texCord: [0, 0],
        },
        bottomRight: {
          texCord: [1, 0],
        },
        topLeft: {
          texCord: [0, 1],
        },
        topRight: {
          texCord: [1, 1],
        },
      },
      buffer: quadBuffer,
      offset: 0,
    });

    this.vertexBuffer.allocateWithData(this.gl, quadBuffer);

    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
  }

  render(canvasFramebuffer: FrameBuffer): void {
    this.vertexArray.bind(this.gl);
    this.vertexBuffer.bind(this.gl);

    const canvasTexture = canvasFramebuffer.getTextureAttachment();

    clearScreen(this.gl, 0, 0, 0, 1);
    this.gl.blendFunc(this.gl.ONE, this.gl.ZERO);

    this.shader.use(this.gl);
    this.shader.uploadMatrix4x4(this.gl, 'view', this.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(this.gl, 'projection', this.camera.getProjectionMatrix());

    this.gl.activeTexture(this.gl.TEXTURE0);
    canvasTexture.bind(this.gl);
    this.shader.uploadTexture(this.gl, 'canvas', canvasTexture, 0);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, NUM_VERTEX_QUAD);

    canvasTexture.unBind(this.gl);
    this.shader.stopUsing(this.gl);

    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.vertexArray.unBind(this.gl);
    this.vertexBuffer.unBind(this.gl);
  }
}
