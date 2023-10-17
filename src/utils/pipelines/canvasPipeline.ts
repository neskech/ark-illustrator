import { type GL } from '../web/glUtils';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';
import { type BrushPoint } from '../canvas/tools/brush';
import FrameBuffer from '../web/frameBuffer';
import { clearScreen, emplaceQuads } from './util';

export const MAX_POINTS_PER_FRAME = 10000;

const NUM_VERTICES_QUAD = 6;
const VERTEX_SIZE = 5;
const SIZE_FLOAT = 4;

function initShader(gl: GL, shader: Shader) {
  const fragmentSource = `precision highp float;
                          varying highp vec2 vTextureCoord;
                          varying highp float v_opacity;
                          
                          uniform sampler2D tex;
                          uniform float flow;
                          
                          
                          void main() {
                             //gl_FragColor = vec4(vTextureCoord, 1, 1);//texture2D(tex, vTextureCoord);
                             vec4 color = texture2D(tex, vTextureCoord);

                             float c = (color.r + color.g + color.b) / 3.0;
                             color.r = c;
                             color.g = c;
                             color.b = c;
                             
                             color.a *= flow * v_opacity;
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

export class CanvasPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;
  frameBuffer: FrameBuffer;
  hasDoneInitialRender: boolean;

  public constructor(gl: GL, appState: Readonly<AppState>) {
    this.name = 'Canvas Pipeline';
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.shader = new Shader(gl);
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
    this.hasDoneInitialRender = false;
    this.fillFramebufferWithColor(gl);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    initShader(gl, this.shader);

    bindAll(gl, this);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);

    this.setupEvents(gl, appState);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    unBindAll(gl, this);
  }

  render(gl: GL, points: BrushPoint[], appState: Readonly<AppState>) {
    if (points.length == 0) return;

    bindAll(gl, this);
    this.shader.use(gl);
    this.frameBuffer.bind(gl);

    const buf = new Float32Array(points.length * NUM_VERTICES_QUAD * VERTEX_SIZE);

    const brushSettings = appState.settings.brushSettings[0];
    emplaceQuads(buf, points, brushSettings);

    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadFloat(gl, 'flow', brushSettings.flow);

    brushSettings.texture.map((t) => t.bind(gl));
    brushSettings.texture.map((t) => this.shader.uploadTexture(gl, 'tex', t));

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    brushSettings.texture.map((t) => t.unBind(gl));
    this.frameBuffer.unBind(gl);

    this.hasDoneInitialRender = true;

    this.shader.stopUsing(gl);
    unBindAll(gl, this);
  }

  setupEvents(gl: GL, appState: Readonly<AppState>) {
    appState.inputState.tools['brush'].subscribeToOnBrushStrokeEnd((p) => {
      this.render(gl, p, appState);
    });

    appState.inputState.tools['brush'].subscribeToOnBrushStrokeCutoff((p) => {
      this.render(gl, p, appState);
    });
  }

  getFrameBuffer(): FrameBuffer {
    return this.frameBuffer;
  }

  private fillFramebufferWithColor(gl: GL) {
    this.frameBuffer.bind(gl);
    clearScreen(gl, 1, 1, 1, 1);
    this.frameBuffer.unBind(gl);
  }
}