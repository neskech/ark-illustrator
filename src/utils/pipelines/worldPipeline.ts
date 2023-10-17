import { type GL } from '../web/glUtils';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';
import type Texture from '../web/texture';
import { constructQuadSixWidthHeightTexture } from './util';
import { Float32Vector2 } from 'matrixgl';

const CANVAS_ORIGIN = new Float32Vector2(0, 0)

const SIZE_VERTEX = 4
const NUM_VERTEX_QUAD = 4

function initShader(gl: GL, shader: Shader) {
  const fragmentSource = `precision highp float;
                          varying highp vec2 vTextureCoord;
                          
                          uniform sampler2D canvas;          
                          
                          void main() {
                            gl_FragColor = texture2D(canvas, vTextureCoord);
                          }\n`;

const vertexSource = `attribute vec2 a_position;
                      attribute vec2 aTextureCoord;

                      uniform mat4 model;
                      uniform mat4 view;
                      uniform mat4 projection;

                      varying highp vec2 vTextureCoord;

                      void main() {
                        gl_Position = projection * view * model * vec4(a_position, 0, 1);
                        vTextureCoord = aTextureCoord;     
                      }\n`;

  shader.constructFromSource(gl, vertexSource, fragmentSource).match(
    (_) => console.log('debug shader compilation success!'),
    (e) => {
      throw new Error(`Could not compile stroke preview shader...\n\n${e}`);
    }
  );
}

export class WorldPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  shader: Shader;

  public constructor(gl: GL) {
    this.name = 'Standard Draw Pipeline';
    this.vertexArray = new VertexArrayObject(gl);
    this.vertexBuffer = new Buffer(gl, {
      btype: 'VertexBuffer',
      usage: 'Static Draw',
    });
    this.shader = new Shader(gl);
  }

  init(gl: GL, appState: Readonly<AppState>) {
    bindAll(gl, this);

    this.vertexArray
    .builder()
    .addAttribute(2, 'float', 'position')
    .addAttribute(2, 'float', 'texCord')
    .build(gl);

    initShader(gl, this.shader)

    const w = appState.canvasState.canvas.width
    const h = appState.canvasState.canvas.height
    const aspectRatio = w / h

    const quadVerts = constructQuadSixWidthHeightTexture(CANVAS_ORIGIN, aspectRatio, 1)
    const quadBuffer = new Float32Array(quadVerts.length * SIZE_VERTEX);

    let i = 0;
    for (const vert of quadVerts) {
      quadBuffer[i++] = vert.x
      quadBuffer[i++] = vert.y
    }

    this.vertexBuffer.allocateWithData(gl, quadBuffer);

    unBindAll(gl, this);
  }

  render(gl: GL, canvasTexture: Texture, appState: Readonly<AppState>) {
    bindAll(gl, this);

    canvasTexture.bind(gl)

    this.shader.uploadTexture(gl, 'canvas', canvasTexture)
    this.shader.uploadMatrix4x4(gl, 'model', appState.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', appState.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(
      gl,
      'projection',
      appState.canvasState.camera.getProjectionMatrix()
    );

    gl.drawArrays(gl.TRIANGLES, 0, NUM_VERTEX_QUAD);

    canvasTexture.unBind(gl)

    unBindAll(gl, this);
  }
}
