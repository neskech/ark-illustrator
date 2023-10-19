import { type GL } from '../web/glUtils';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';
import { type BrushSettings, type BrushPoint } from '../canvas/tools/brush';
import FrameBuffer from '../web/frameBuffer';
import { clearScreen, constructQuadSixWidthHeightTexture, emplaceQuads } from './util';
import type Texture from '../web/texture';
import { Float32Vector2 } from 'matrixgl';

export const MAX_POINTS_PER_FRAME = 100000;

const SCREEN_ORIGIN = new Float32Vector2(0, 0);
const SCREEN_WIDTH = 1;
const SCREEN_HEIGHT = 1;

const NUM_VERTICES_QUAD = 6;

const VERTEX_SIZE_POS_TEXTURE = 4;
const SIZE_FULL_SCREEN_QUAD = VERTEX_SIZE_POS_TEXTURE * NUM_VERTICES_QUAD;

const SIZE_FLOAT = 4;
const VERTEX_SIZE_POS_TEX_OPACITY = 5;
const MAX_SIZE_STROKE =
  MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_TEX_OPACITY * SIZE_FLOAT;

function initStrokeShader(gl: GL, shader: Shader) {
  const fragmentSource = `precision highp float;
                          varying highp vec2 vTextureCoord;
                          varying highp float v_opacity;
                          
                          uniform sampler2D tex;
                          uniform float flow;
                          
                          
                          void main() {
                             vec4 color = texture2D(tex, vTextureCoord);
                             color.rgb *= v_opacity;
                             color.a *= flow;
                             gl_FragColor = color;
                          }\n`;

  const vertexSource = `attribute vec2 a_position;
                        attribute vec2 aTextureCoord;
                        attribute float a_opacity;

                        varying highp vec2 vTextureCoord;
                        varying highp float v_opacity;

                        void main() {
                          gl_Position = vec4(a_position, 0, 1);
                          vTextureCoord = aTextureCoord;     
                          v_opacity = a_opacity;        
                        }\n`;

  shader.constructFromSource(gl, vertexSource, fragmentSource).match(
    (_) => console.log('standard draw shader compilation success!'),
    (e) => {
      throw new Error(`Could not compile debug shader...\n\n${e}`);
    }
  );
}

function initFullScreenBlitShader(gl: GL, shader: Shader) {
  const fragmentSource = `precision highp float;
                          varying highp vec2 vTextureCoord;
                          
                          uniform sampler2D canvas;          
                          
                          void main() {
                            gl_FragColor = texture2D(canvas, vTextureCoord);
                          }\n`;

  const vertexSource = `attribute vec2 a_position;
                      attribute vec2 aTextureCoord;

                      varying highp vec2 vTextureCoord;

                      void main() {
                        gl_Position = vec4(a_position, 0, 1);
                        vTextureCoord = aTextureCoord;     
                      }\n`;

  shader.constructFromSource(gl, vertexSource, fragmentSource).match(
    (_) => console.log('debug shader compilation success!'),
    (e) => {
      throw new Error(`Could not compile stroke preview shader...\n\n${e}`);
    }
  );
}

export class StrokePipeline {
  name: string;

  strokeVertexArray: VertexArrayObject;
  fullScreenBlitVertexArray: VertexArrayObject;

  strokeVertexBuffer: Buffer;
  fullScreenBlitVertexBuffer: Buffer;

  strokeShader: Shader;
  fullScreenBlitShader: Shader;

  frameBuffer: FrameBuffer;

  public constructor(gl: GL, appState: Readonly<AppState>) {
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

    this.strokeShader = new Shader(gl);
    this.fullScreenBlitShader = new Shader(gl);

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

  init(gl: GL, canvasFramebuffer: FrameBuffer, appState: Readonly<AppState>) {
    initStrokeShader(gl, this.strokeShader);
    initFullScreenBlitShader(gl, this.fullScreenBlitShader);

    this.setupEvents(gl, canvasFramebuffer, appState);

    this.strokeVertexArray.bind(gl);
    this.strokeVertexBuffer.bind(gl);

    this.strokeVertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);


    this.strokeVertexBuffer.allocateWithData(gl, new Float32Array(MAX_SIZE_STROKE));

    this.strokeVertexArray.unBind(gl);
    this.strokeVertexBuffer.unBind(gl);

    this.fullScreenBlitVertexArray.bind(gl);
    this.fullScreenBlitVertexBuffer.bind(gl);

    this.fullScreenBlitVertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .build(gl);

    const quadVerts = constructQuadSixWidthHeightTexture(
      SCREEN_ORIGIN,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    );
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
    canvasTexture.bind(gl);

    this.fullScreenBlitShader.uploadTexture(gl, 'canvas', canvasTexture);

    gl.drawArrays(gl.TRIANGLES, 0, SIZE_FULL_SCREEN_QUAD);

    canvasTexture.unBind(gl);
    this.fullScreenBlitShader.stopUsing(gl);
    this.fullScreenBlitVertexArray.unBind(gl);
    this.fullScreenBlitVertexBuffer.unBind(gl);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private renderStroke(gl: GL, points: BrushPoint[], brushSettings: BrushSettings) {
    this.strokeVertexArray.bind(gl);
    this.strokeVertexBuffer.bind(gl);
    this.strokeShader.use(gl);
    brushSettings.texture.unwrap().bind(gl);

    this.strokeShader.uploadFloat(gl, 'flow', brushSettings.flow);
    this.strokeShader.uploadTexture(gl, 'tex', brushSettings.texture.unwrap());

    const bufSize = points.length * NUM_VERTICES_QUAD * VERTEX_SIZE_POS_TEX_OPACITY;
    const buf = new Float32Array(bufSize);

    emplaceQuads(buf, points, brushSettings);
    this.strokeVertexBuffer.addData(gl, buf);

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    this.strokeShader.stopUsing(gl);
    this.strokeVertexArray.unBind(gl);
    this.strokeVertexBuffer.unBind(gl);
    brushSettings.texture.unwrap().unBind(gl);
  }

  render(gl: GL, points: BrushPoint[], canvasTexture: Texture, appState: Readonly<AppState>) {
    if (points.length == 0) return;

    this.frameBuffer.bind(gl);
    clearScreen(gl, 0, 0, 0, 0)

    const brushSettings = appState.settings.brushSettings[0];

    this.renderCanvasTexture(gl, canvasTexture);
    this.renderStroke(gl, points, brushSettings);

    this.frameBuffer.unBind(gl);
  }

  setupEvents(gl: GL, canvasFramebuffer: FrameBuffer, appState: Readonly<AppState>) {
    appState.inputState.tools['brush'].subscribeToOnBrushStrokeContinued((p) => {
      const texture = canvasFramebuffer.getTextureAttachment();
      this.render(gl, p, texture, appState);
    });
    appState.inputState.tools['brush'].subscribeToOnBrushStrokeEnd((_) => {
      this.frameBuffer.bind(gl);
      clearScreen(gl, 0, 0, 0, 0)
      const texture = canvasFramebuffer.getTextureAttachment();
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
