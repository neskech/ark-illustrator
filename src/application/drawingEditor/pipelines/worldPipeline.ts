import { Float32Vector2 } from 'matrixgl';
import Buffer from '~/application/drawingEditor/webgl/buffer';
import type Camera from '../canvas/camera';
import { Ok, unit, type Result, type Unit } from '../../general/result';
import { type GL } from '../webgl/glUtils';
import Shader from '../webgl/shader';
import type Texture from '../webgl/texture';
import { VertexArrayObject } from '../webgl/vertexArray';
import { clearScreen, constructQuadSixWidthHeightTexture } from './util';

const CANVAS_ORIGIN = new Float32Vector2(0, 0);

const SIZE_VERTEX = 4;
const NUM_VERTEX_QUAD = 6;

export class WorldPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;
  rot = 0;

  public constructor(gl: GL) {
    this.name = 'World Pipeline';
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.shader = new Shader(gl, 'world');
  }

  async init(gl: GL, camera: Camera): Promise<Result<Unit, string>> {
    const res = await this.shader.constructAsync(gl, 'world');
    if (res.isErr()) return res;

    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .build(gl);

    const aspectRatio = camera.getAspRatio();
    const quadVerts = constructQuadSixWidthHeightTexture(CANVAS_ORIGIN, aspectRatio / 2, 0.5);
    const quadBuffer = new Float32Array(quadVerts.length * SIZE_VERTEX);

    let i = 0;
    for (const vert of quadVerts) {
      quadBuffer[i++] = vert.x;
      quadBuffer[i++] = vert.y;
    }

    this.vertexBuffer.allocateWithData(gl, quadBuffer);

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);

    return Ok(unit);
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
