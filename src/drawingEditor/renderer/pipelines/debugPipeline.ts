import { type Float32Vector2 } from 'matrixgl';
import type Texture from '../../webgl/texture';
import type AssetManager from '../assetManager';
import Buffer from '~/drawingEditor/webgl/buffer';
import type Shader from '../../webgl/shader';
import { type GL } from '../../webgl/glUtils';
import { assertNotNull, requires } from '~/util/general/contracts';
import { VertexArrayObject } from '../../webgl/vertexArray';

function emplaceQuad(
  buffer: Float32Array,
  position: Float32Vector2,
  width: number,
  height: number
) {}

export default class DebugRenderer {
  private wireQuadTexture: Texture;
  private filledQuadTexture: Texture;
  private wireCircleTexture: Texture;
  private filledCircleTexture: Texture;
  private shader: Shader;
  private vertexBuffer: Buffer;
  private vertexArray: VertexArrayObject;
  private static instance: DebugRenderer | null;

  private constructor(gl: GL, assetManager: AssetManager) {
    this.wireQuadTexture = assetManager.getTexture('wireQuad');
    this.filledQuadTexture = assetManager.getTexture('filledQuad');
    this.wireCircleTexture = assetManager.getTexture('wireCircle');
    this.filledCircleTexture = assetManager.getTexture('filledCircle');
    this.shader = assetManager.getShader('debug');
    this.vertexBuffer = new Buffer(gl, { btype: 'VertexBuffer', usage: 'Static Draw' });
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexArray;
  }

  private static getInstance(): DebugRenderer {
    assertNotNull(this.instance, 'debug renderer must be initialized before called get instance');
    return this.instance;
  }

  static initialize(gl: GL, assetManager: AssetManager) {
    this.instance = new DebugRenderer(gl, assetManager);
  }

  static drawWiredQuad(position: Float32Vector2, width: number, height: number) {}

  static drawFilledQuad(position: Float32Vector2, width: number, height: number) {}

  static drawWiredCircle(position: Float32Vector2, radius: number) {}

  static drawFilledCircle(position: Float32Vector2, radius: number) {}

  static render() {}

  static flush() {}

  private initializeBuffers(gl: GL) {
    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(3, 'float', 'color')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);
  }
}
