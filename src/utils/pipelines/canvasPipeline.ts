import Buffer from '~/utils/web/buffer';
import { type BrushSettings, type BrushPoint } from '../canvas/tools/brush';
import EventManager from '../event/eventManager';
import { Ok, unit, type Result, type Unit } from '../func/result';
import FrameBuffer from '../web/frameBuffer';
import { type GL } from '../web/glUtils';
import Shader from '../web/shader';
import { VertexArrayObject } from '../web/vertexArray';
import { MAX_POINTS_PER_FRAME } from './strokePipeline';
import { clearScreen, emplaceQuads } from './util';

const NUM_VERTICES_QUAD = 6;
const VERTEX_SIZE = 8;
const SIZE_FLOAT = 4;

export class CanvasPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;
  frameBuffer: FrameBuffer;

  public constructor(gl: GL, canvas: HTMLCanvasElement) {
    this.name = 'Canvas Pipeline';
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.shader = new Shader(gl, 'canvas');
    this.frameBuffer = new FrameBuffer(gl, {
      width: canvas.width,
      height: canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.fillFramebufferWithWhite(gl);
  }

  async init(gl: GL): Promise<Result<Unit, string>> {
    const res = await this.shader.constructAsync(gl, 'canvas');
    if (res.isErr()) return res;

    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(3, 'float', 'color')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);

    this.setupEvents(gl);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);

    return Ok(unit);
  }

  render(gl: GL, points: BrushPoint[], brushSettings: Readonly<BrushSettings>) {
    if (points.length == 0) return;

    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);
    this.frameBuffer.bind(gl);
    this.shader.use(gl);
    gl.activeTexture(gl.TEXTURE0);
    brushSettings.texture.map((t) => t.bind(gl));

    if (brushSettings.isEraser) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    const buf = new Float32Array(points.length * NUM_VERTICES_QUAD * VERTEX_SIZE);
    emplaceQuads(buf, points, brushSettings);
    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadFloat(gl, 'flow', brushSettings.flow);
    brushSettings.texture.map((t) => this.shader.uploadTexture(gl, 'tex', t, 0));

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    brushSettings.texture.map((t) => t.unBind(gl));
    this.frameBuffer.unBind(gl);
    this.shader.stopUsing(gl);
    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);
  }

  setupEvents(gl: GL) {
    EventManager.subscribe(
      'brushStrokEnd',
      ({ pointData, currentSettings }) => this.render(gl, pointData, currentSettings),
      true
    );
    EventManager.subscribe(
      'brushStrokCutoff',
      ({ pointData, currentSettings }) => this.render(gl, pointData, currentSettings),
      true
    );
  }

  getFrameBuffer(): FrameBuffer {
    return this.frameBuffer;
  }

  fillFramebufferWithWhite(gl: GL) {
    this.frameBuffer.bind(gl);
    clearScreen(gl, 1, 1, 1, 1);
    this.frameBuffer.unBind(gl);
  }
}
