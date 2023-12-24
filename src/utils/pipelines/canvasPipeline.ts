import { type GL } from '../web/glUtils';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';
import { type BrushPoint } from '../canvas/tools/brush';
import FrameBuffer from '../web/frameBuffer';
import { clearScreen, emplaceQuads } from './util';
import { MAX_POINTS_PER_FRAME } from './strokePipeline';
import EventManager from '../event/eventManager';
import { Ok, type Result, type Unit, unit } from '../func/result';

const NUM_VERTICES_QUAD = 6;
const VERTEX_SIZE = 5;
const SIZE_FLOAT = 4;

export class CanvasPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;
  frameBuffer: FrameBuffer;

  public constructor(gl: GL, appState: Readonly<AppState>) {
    this.name = 'Canvas Pipeline';
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.shader = new Shader(gl, 'canvas');
    this.frameBuffer = new FrameBuffer(gl, {
      width: appState.canvasState.canvas.width,
      height: appState.canvasState.canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Nearest',
      minFilter: 'Nearest',
      format: 'RGBA',
    });
    this.fillFramebufferWithWhite(gl);
  }

  async init(gl: GL, appState: Readonly<AppState>): Promise<Result<Unit, string>> {
    const res = await this.shader.constructAsync(gl, 'canvas');
    if (res.isErr()) return res;

    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);

    this.setupEvents(gl, appState);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);

    return Ok(unit);
  }

  render(gl: GL, points: BrushPoint[], appState: Readonly<AppState>) {
    if (points.length == 0) return;

    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    const brushSettings = appState.settings.brushSettings[0];

    this.vertexArray.bind(gl);
    this.vertexBuffer.bind(gl);
    this.frameBuffer.bind(gl);
    this.shader.use(gl);
    gl.activeTexture(gl.TEXTURE0);
    brushSettings.texture.map((t) => t.bind(gl));

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

  setupEvents(gl: GL, appState: Readonly<AppState>) {
    EventManager.subscribe('brushStrokEnd', (p) => this.render(gl, p, appState), true);
    EventManager.subscribe('brushStrokCutoff', (p) => this.render(gl, p, appState), true);
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
