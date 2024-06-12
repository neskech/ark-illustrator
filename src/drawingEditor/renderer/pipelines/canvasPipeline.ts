import Buffer from '~/drawingEditor/webgl/buffer';
import EventManager from '../../../util/eventSystem/eventManager';
import { type BrushPoint } from '../../canvas/toolSystem/tools/brush';
import FrameBuffer from '../../webgl/frameBuffer';
import { type GL } from '../../webgl/glUtils';
import type Shader from '../../webgl/shader';
import { VertexArrayObject } from '../../webgl/vertexArray';
import type AssetManager from '../assetManager';
import { clearScreen, emplaceQuads } from '../util';
import { MAX_POINTS_PER_FRAME } from './strokePipeline';
import { VertexAttributes, VertexAttributeType } from '~/drawingEditor/webgl/vertexAttributes';
import { type BrushSettings } from '../../canvas/toolSystem/settings/brushSettings';

const NUM_VERTICES_QUAD = 6;
const VERTEX_SIZE = 8;
const SIZE_FLOAT = 4;

const vertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
  color: VertexAttributeType.floatList(3),
  texCord: VertexAttributeType.floatList(2),
  opacity: VertexAttributeType.float(),
});

export class CanvasPipeline {
  name: string;
  vertexArray: VertexArrayObject<typeof vertexAttributes>;
  vertexBuffer: Buffer;
  shader: Shader;
  frameBuffer: FrameBuffer;

  public constructor(gl: GL, canvas: HTMLCanvasElement, assetManager: AssetManager) {
    this.name = 'Canvas Pipeline';
    this.vertexArray = new VertexArrayObject(gl, vertexAttributes);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
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
    this.shader = assetManager.getShader('canvas');
  }

  init(gl: GL) {
    this.vertexArray.bind(gl)
    this.vertexBuffer.bind(gl);

    this.setupEvents(gl);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    this.vertexArray.unBind(gl);
    this.vertexBuffer.unBind(gl);
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
