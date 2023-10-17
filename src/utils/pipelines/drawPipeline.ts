import { type GL } from '../web/glUtils';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import {
  constructLinesSixPressureNormal,
  constructQuadIndices,
  constructQuadSixPressureNormal,
  constructQuadSixPressureNormalUV,
  constructQuadSixTex,
  emplaceQuads,
} from './util';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { type AppState } from '../mainRoutine';
import { type BrushPoint, getSizeGivenPressure, getOpacityGivenPressure } from '../canvas/tools/brush';
import { assert } from '../contracts';
import { Float32Vector2, Float32Vector3, Matrix4 } from 'matrixgl';
import Texture from '../web/texture';
import FrameBuffer from '../web/frameBuffer';

export const MAX_POINTS_PER_FRAME = 10000;

const DISTANCE_FROM_CANVAS = 10
const ZNEAR = 0.001
const ZFAR = 20

const NUM_VERTICES_QUAD = 6;
const NUM_INDICES_QUAD = 6;
const VERTEX_SIZE = 5;
const SIZE_INTEGER = 4;
const SIZE_FLOAT = 4;

function fillEbo(gl: GL, ebo: Buffer) {
  const buf = new Uint32Array(MAX_POINTS_PER_FRAME * NUM_INDICES_QUAD);

  const numQuads = MAX_POINTS_PER_FRAME;
  for (let i = 0; i < numQuads; i++) {
    const indexOffset = i * NUM_INDICES_QUAD;
    const indices = constructQuadIndices(indexOffset);

    for (let j = 0; j < indices.length; j++) buf[indexOffset + j] = indices[j];
  }

  ebo.allocateWithData(gl, buf);
}

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
                             color.r = 1.0 - c;
                             color.g = 1.0 - c;
                             color.b = 1.0 - c;
                             
                             color.a *= flow * v_opacity;
                             gl_FragColor = color;
                          }\n`;

  const vertexSource = `attribute vec2 a_position;
                        attribute vec2 aTextureCoord;
                        attribute float a_opacity;

                        uniform mat4 model;
                        uniform mat4 view;
                        uniform mat4 projection;

                        varying highp vec2 vTextureCoord;
                        varying highp float v_opacity;

                        void main() {
                          gl_Position = projection * view * model * vec4(a_position, 0, 1);
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

export class DrawPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  indexBuffer: Buffer;
  shader: Shader;
  brushTexture: Texture;
  frameBuffer: FrameBuffer

  public constructor(gl: GL, appState: Readonly<AppState>) {
    this.name = 'Standard Draw Pipeline';

    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.indexBuffer = new Buffer(gl, {
      btype: 'IndexBuffer',
      usage: 'Static Draw',
    });

    this.shader = new Shader(gl);

    this.brushTexture = new Texture(gl, {
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Linear',
      minFilter: 'Linear',
      format: 'RGBA',
    });
    this.brushTexture.allocateFromImageUrl(
      gl,
      'https://cdn.discordapp.com/attachments/612361044110868480/1163576886761369751/watercolor-brush-texture-5.png?ex=6540146c&is=652d9f6c&hm=a25b453b0bc79a59f3112e84aa3129586c14868864f1a9bc2144e22816eae94f&',
      false
    );

    this.frameBuffer = new FrameBuffer(gl, {
      width: appState.canvasState.canvas.width,
      height: appState.canvasState.canvas.height,
      target: 'Regular',
      wrapX: 'Repeat',
      wrapY: 'Repeat',
      magFilter: 'Linear',
      minFilter: 'Linear',
      format: 'RGBA',
    })
  }

  init(gl: GL, appState: Readonly<AppState>) {
    bindAll(gl, this, false);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .addAttribute(1, 'float', 'opacity')
      .build(gl);

    fillEbo(gl, this.indexBuffer);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * VERTEX_SIZE * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    initShader(gl, this.shader);

    appState.toolState.tools['brush'].subscribeToOnBrushStrokeContinued((p) =>
      this.render(gl, p, appState)
    );
    appState.toolState.tools['brush'].subscribeToOnBrushStrokeEnd((_) => {
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });

    unBindAll(gl, this);
  }

  render(gl: GL, points: BrushPoint[], appState: Readonly<AppState>) {
    bindAll(gl, this);

    this.frameBuffer.bind(gl)

    if (points.length == 0) return;
    assert(points.length < MAX_POINTS_PER_FRAME);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const buf = new Float32Array(points.length * 6 * VERTEX_SIZE);

    const brushSettings = appState.settings.brushSettings[0];
    emplaceQuads(buf, points, brushSettings)

    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadMatrix4x4(gl, 'model', appState.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', appState.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(
      gl,
      'projection',
      appState.canvasState.camera.getProjectionMatrix()
    );
    this.shader.uploadFloat(gl, 'flow', 0.5)

    this.brushTexture.bind(gl);
    this.shader.uploadTexture(gl, 'tex', this.brushTexture);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * points.length);

    this.brushTexture.unBind(gl);
    this.frameBuffer.unBind(gl)

    unBindAll(gl, this);
  }

  getFrameBuffer(): FrameBuffer {
    return this.frameBuffer
  }
  
  private getViewMatrix() {
      const eye = new Float32Vector3(0, 0, 0)
      const lookAtPos = new Float32Vector3(0, 0, DISTANCE_FROM_CANVAS);
      const upVector = new Float32Vector3(0, 1, 0);
  
      return Matrix4.lookAt(eye, lookAtPos, upVector);
  }

  private getProjectionMatrix(width: number, height: number) {
    const aspectRatio = width / height
    return Matrix4.orthographic({
      top: 1,
      bottom: -1,
      left: -aspectRatio,
      right: aspectRatio,
      near: ZNEAR,
      far: ZFAR
    })
  }
}
