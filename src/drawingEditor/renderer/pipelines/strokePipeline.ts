import { Float32Vector2 } from 'matrixgl';
import Buffer from '~/drawingEditor/webgl/buffer';
import EventManager from '../../../util/eventSystem/eventManager';
import { type BrushPoint } from '../../canvas/toolSystem/tools/brush';
import FrameBuffer from '../../webgl/frameBuffer';
import { type GL } from '../../webgl/glUtils';
import type Shader from '../../webgl/shader';
import type Texture from '../../webgl/texture';
import { VertexArrayObject } from '../../webgl/vertexArray';
import type AssetManager from '../assetManager';
import { clearScreen, constructQuadSixWidthHeight, emplaceQuads } from '../util';
import { type BrushSettings } from '../../canvas/toolSystem/settings/brushSettings';
import { VertexAttributes, VertexAttributeType } from '~/drawingEditor/webgl/vertexAttributes';

export const MAX_POINTS_PER_FRAME = 10000;

const SCREEN_ORIGIN = new Float32Vector2(0, 0);
const SCREEN_WIDTH = 1;
const SCREEN_HEIGHT = 1;

const NUM_VERTICES_QUAD = 6;

const VERTEX_SIZE_POS_ = 2;
const SIZE_FULL_SCREEN_QUAD = VERTEX_SIZE_POS_ * NUM_VERTICES_QUAD;

const SIZE_FLOAT = 4;
const VERTEX_SIZE_POS_COLOR_TEX_OPACITY = 8;
const MAX_SIZE_STROKE =
  MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY * SIZE_FLOAT;

const strokeVertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2),
  color: VertexAttributeType.floatList(3),
  texCord: VertexAttributeType.floatList(2),
  opacity: VertexAttributeType.float(),
});

const blitVertexAttributes = new VertexAttributes({
  position: VertexAttributeType.floatList(2)
})

export class StrokePipeline {
  name: string;

  strokeVertexArray: VertexArrayObject<typeof strokeVertexAttributes>;
  fullScreenBlitVertexArray: VertexArrayObject<typeof blitVertexAttributes>;

  strokeVertexBuffer: Buffer;
  fullScreenBlitVertexBuffer: Buffer;

  strokeShader: Shader;
  fullScreenBlitShader: Shader;

  frameBuffer: FrameBuffer;

  public constructor(gl: GL, canvas: HTMLCanvasElement, assetManager: AssetManager) {
    this.name = 'Stroke Preview Pipeline';

    this.strokeVertexArray = new VertexArrayObject(gl, strokeVertexAttributes);
    this.fullScreenBlitVertexArray = new VertexArrayObject(gl, blitVertexAttributes);

    this.strokeVertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.fullScreenBlitVertexBuffer = new Buffer(gl, {
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
    this.strokeShader = assetManager.getShader('stroke');
    this.fullScreenBlitShader = assetManager.getShader('blit');
  }

  init(gl: GL, canvasFramebuffer: FrameBuffer) {
    this.setupEvents(gl, canvasFramebuffer);

    this.strokeVertexArray.bind(gl);
    this.strokeVertexBuffer.bind(gl);

    this.strokeVertexArray.applyAttributes(gl)
    this.strokeVertexBuffer.allocateWithData(gl, new Float32Array(MAX_SIZE_STROKE));

    this.strokeVertexArray.unBind(gl);
    this.strokeVertexBuffer.unBind(gl);

    this.fullScreenBlitVertexArray.bind(gl);
    this.fullScreenBlitVertexBuffer.bind(gl);

    this.fullScreenBlitVertexArray.applyAttributes(gl)

    const quadVerts = constructQuadSixWidthHeight(SCREEN_ORIGIN, SCREEN_WIDTH, SCREEN_HEIGHT);
    const quadBuffer = new Float32Array(SIZE_FULL_SCREEN_QUAD);

    let i = 0;
    for (const vert of quadVerts) {
      quadBuffer[i++] = vert.x;
      quadBuffer[i++] = vert.y;
    }

    this.fullScreenBlitVertexBuffer.allocateWithData(gl, quadBuffer);

    this.fullScreenBlitVertexArray.unBind(gl);
    this.fullScreenBlitVertexBuffer.unBind(gl);
  }

  private renderCanvasTexture(gl: GL, canvasTexture: Texture) {
    gl.blendFunc(gl.ONE, gl.ZERO);

    this.fullScreenBlitVertexArray.bind(gl);
    this.fullScreenBlitVertexBuffer.bind(gl);
    this.fullScreenBlitShader.use(gl);

    gl.activeTexture(gl.TEXTURE0);
    canvasTexture.bind(gl);
    this.fullScreenBlitShader.uploadTexture(gl, 'canvas', canvasTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    canvasTexture.unBind(gl);
    this.fullScreenBlitShader.stopUsing(gl);
    this.fullScreenBlitVertexArray.unBind(gl);
    this.fullScreenBlitVertexBuffer.unBind(gl);
  }

  private renderStroke(gl: GL, points: BrushPoint[], brushSettings: BrushSettings) {
    this.strokeVertexArray.bind(gl);
    this.strokeVertexBuffer.bind(gl);
    this.strokeShader.use(gl);

    gl.activeTexture(gl.TEXTURE0);
    brushSettings.texture.unwrap().bind(gl);

    if (brushSettings.isEraser) gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

    this.strokeShader.uploadFloat(gl, 'flow', brushSettings.flow);
    this.strokeShader.uploadTexture(gl, 'tex', brushSettings.texture.unwrap(), 0);

    const bufSize = points.length * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_COLOR_TEX_OPACITY;
    const buf = new Float32Array(bufSize);

    emplaceQuads(buf, points, brushSettings);
    this.strokeVertexBuffer.addData(gl, buf);

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    this.strokeShader.stopUsing(gl);
    this.strokeVertexArray.unBind(gl);
    this.strokeVertexBuffer.unBind(gl);
    brushSettings.texture.unwrap().unBind(gl);
  }

  render(
    gl: GL,
    points: BrushPoint[],
    canvasTexture: Texture,
    brushSettings: Readonly<BrushSettings>
  ) {
    if (points.length == 0) return;

    this.frameBuffer.bind(gl);
    clearScreen(gl, 1, 0, 0, 1);

    this.renderCanvasTexture(gl, canvasTexture);
    this.renderStroke(gl, points, brushSettings);

    this.frameBuffer.unBind(gl);
  }

  refreshCanvasTexture(gl: GL, canvasFrameBuffer: FrameBuffer) {
    this.frameBuffer.bind(gl);
    const texture = canvasFrameBuffer.getTextureAttachment();
    this.renderCanvasTexture(gl, texture);
    this.frameBuffer.unBind(gl);
  }

  setupEvents(gl: GL, canvasFrameBuffer: FrameBuffer) {
    EventManager.subscribe('brushStrokeContinued', ({ pointData, currentSettings }) => {
      const texture = canvasFrameBuffer.getTextureAttachment();
      this.render(gl, pointData, texture, currentSettings);
    });

    EventManager.subscribe('brushStrokEnd', (_) => {
      this.frameBuffer.bind(gl);
      clearScreen(gl, 0, 0, 0, 0);
      const texture = canvasFrameBuffer.getTextureAttachment();
      this.renderCanvasTexture(gl, texture);
      this.frameBuffer.unBind(gl);
    });
  }

  getFrameBuffer(): FrameBuffer {
    return this.frameBuffer;
  }

  private fillFramebufferWithWhite(gl: GL) {
    this.frameBuffer.bind(gl);
    clearScreen(gl, 1, 1, 1, 1);
    this.frameBuffer.unBind(gl);
  }
}
