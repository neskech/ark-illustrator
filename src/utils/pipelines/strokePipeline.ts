import { Float32Vector2 } from 'matrixgl';
import Buffer from '~/utils/web/buffer';
import { type BrushPoint, type BrushSettings } from '../canvas/tools/brush';
import EventManager from '../event/eventManager';
import { Ok, unit, type Result, type Unit } from '../func/result';
import FrameBuffer from '../web/frameBuffer';
import { type GL } from '../web/glUtils';
import Shader from '../web/shader';
import type Texture from '../web/texture';
import { VertexArrayObject } from '../web/vertexArray';
import { clearScreen, constructQuadSixWidthHeight, emplaceQuads } from './util';

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

export class StrokePipeline {
  name: string;

  strokeVertexArray: VertexArrayObject;
  fullScreenBlitVertexArray: VertexArrayObject;

  strokeVertexBuffer: Buffer;
  fullScreenBlitVertexBuffer: Buffer;

  strokeShader: Shader;
  fullScreenBlitShader: Shader;

  frameBuffer: FrameBuffer;

  public constructor(gl: GL, canvas: HTMLCanvasElement) {
    this.name = 'Stroke Preview Pipeline';

    this.strokeVertexArray = new VertexArrayObject(gl);
    this.fullScreenBlitVertexArray = new VertexArrayObject(gl);

    this.strokeVertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.fullScreenBlitVertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });

    this.strokeShader = new Shader(gl, 'stroke');
    this.fullScreenBlitShader = new Shader(gl, 'blit');

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

  async init(
    gl: GL,
    canvasFramebuffer: FrameBuffer
  ): Promise<Result<Unit, string>> {
    const res1 = await this.strokeShader.constructAsync(gl, 'stroke');
    const res2 = await this.fullScreenBlitShader.constructAsync(gl, 'blit');

    if (res1.isErr()) return res1;
    if (res2.isErr()) return res2;

    this.setupEvents(gl, canvasFramebuffer);

    this.strokeVertexArray.bind(gl);
    this.strokeVertexBuffer.bind(gl);

    this.strokeVertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(3, 'float', 'color')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);

    this.strokeVertexBuffer.allocateWithData(gl, new Float32Array(MAX_SIZE_STROKE));

    this.strokeVertexArray.unBind(gl);
    this.strokeVertexBuffer.unBind(gl);

    this.fullScreenBlitVertexArray.bind(gl);
    this.fullScreenBlitVertexBuffer.bind(gl);

    this.fullScreenBlitVertexArray.builder().addAttribute(2, 'float', 'position').build(gl);

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

    return Ok(unit);
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

    if (brushSettings.isEraser) 
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    else
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

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

  render(gl: GL, points: BrushPoint[], canvasTexture: Texture,  brushSettings: Readonly<BrushSettings>) {
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
    EventManager.subscribe('brushStrokeContinued', ({pointData, currentSettings}) => {
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
