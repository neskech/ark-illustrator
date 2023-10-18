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
                             vec4 color = texture2D(tex, vTextureCoord);

                             float c = (color.r + color.g + color.b) / 3.0;
                             color.r = c;
                             color.g = c;
                             color.b = c;
                             
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

export class StrokePreviewPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;
  frameBuffer: FrameBuffer;

  public constructor(gl: GL, appState: Readonly<AppState>) {
    this.name = 'Stroke Preview Pipeline';
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
    this.fillFramebufferWithWhite(gl);
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

    const brushSettings = appState.settings.brushSettings[0];

    bindAll(gl, this);

    this.shader.use(gl);
    this.frameBuffer.bind(gl);
    brushSettings.texture.unwrap().bind(gl);

    clearScreen(gl, 0, 0, 0, 0);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const buf = new Float32Array(points.length * NUM_VERTICES_QUAD * VERTEX_SIZE);
    emplaceQuads(buf, points, brushSettings);

    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadFloat(gl, 'flow', brushSettings.flow);

    this.shader.uploadTexture(gl, 'tex', brushSettings.texture.unwrap());

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTICES_QUAD * points.length);

    this.frameBuffer.unBind(gl);
    brushSettings.texture.unwrap().unBind(gl);

    this.shader.stopUsing(gl);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  

  }

  setupEvents(gl: GL, appState: Readonly<AppState>) {
    appState.inputState.tools['brush'].subscribeToOnBrushStrokeContinued((p) =>
      this.render(gl, p, appState)
    );
    appState.inputState.tools['brush'].subscribeToOnBrushStrokeEnd((_) => {
      this.frameBuffer.bind(gl);
      clearScreen(gl, 1, 1, 1, 0); 
      this.frameBuffer.unBind(gl);
    }, true);
  }

  getFrameBuffer(): FrameBuffer {
    return this.frameBuffer;
  }

  private fillFramebufferWithWhite(gl: GL) {
    this.frameBuffer.bind(gl);
    clearScreen(gl, 1, 1, 1, 0);
    this.frameBuffer.unBind(gl);
  }
}
