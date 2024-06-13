import { Float32Vector2 } from 'matrixgl';
import Buffer from '~/drawingEditor/webgl/buffer';
import type Camera from '../../canvas/camera';
import { type GL } from '../../webgl/glUtils';
import type Shader from '../../webgl/shader';
import type Texture from '../../webgl/texture';
import { VertexArrayObject } from '../../webgl/vertexArray';
import type AssetManager from '../assetManager';
import { clearScreen } from '../util';
import {
  type GetAttributesType,
  VertexAttributes,
  VertexAttributeType,
} from '~/drawingEditor/webgl/vertexAttributes';
import { QuadilateralFactory } from '../geometry/quadFactory';
import { QuadTransform } from '../geometry/transform';
import { QuadPositioner } from '../geometry/positioner';
import { QuadRotator } from '../geometry/rotator';

const CANVAS_ORIGIN = new Float32Vector2(0, 0);

const SIZE_VERTEX = 4;
const NUM_VERTEX_QUAD = 6;

const vertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
  texCord: VertexAttributeType.floatList(2),
});
type AttribsType = GetAttributesType<typeof vertexAttributes>;

export class WorldPipeline {
  name: string;
  vertexArray: VertexArrayObject<AttribsType>;
  vertexBuffer: Buffer;
  quadFactory: QuadilateralFactory<AttribsType>;
  shader: Shader;

  public constructor(gl: GL, assetManager: AssetManager) {
    this.name = 'World Pipeline';
    this.vertexArray = new VertexArrayObject(gl, vertexAttributes);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.quadFactory = new QuadilateralFactory(vertexAttributes);
    this.shader = assetManager.getShader('world');
  }

  init(gl: GL, camera: Camera) {
    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);

    this.vertexArray.applyAttributes(gl);
    const aspectRatio = camera.getAspRatio();
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

    this.vertexBuffer.allocateWithData(gl, quadBuffer);

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);
  }

  render(gl: GL, canvasTexture: Texture, camera: Camera) {
    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);

    clearScreen(gl, 0, 0, 0, 1);
    gl.blendFunc(gl.ONE, gl.ZERO);

    this.shader.use(gl);
    this.shader.uploadMatrix4x4(gl, 'view', camera.getViewMatrix());
    this.shader.uploadMatrix4x4(gl, 'projection', camera.getProjectionMatrix());

    gl.activeTexture(gl.TEXTURE0);
    canvasTexture.bind(gl);
    this.shader.uploadTexture(gl, 'canvas', canvasTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTEX_QUAD);

    canvasTexture.unBind(gl);
    this.shader.stopUsing(gl);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);
  }
}
