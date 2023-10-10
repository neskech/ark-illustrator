import { type GL } from '../web/glUtils';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import { Some } from '../func/option';
import Shader from '../web/shader';
import { constructQuadIndices, constructQuadSixTex } from './util';
import { processPath } from '../canvas/tools/brush';
import { copy } from '../web/vector';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { type AppState } from '../mainRoutine';
import { Float32Vector2 } from 'matrixgl';

const MAX_POINTS_PER_FRAME = 500;
const NUM_VERTICES_QUAD = 4;
const NUM_INDICES_QUAD = 6;
const VERTEX_SIZE = 4;
const SIZE_INTEGER = 4;
const SIZE_FLOAT = 4;

const MAX_PREV_POINTS = 20;

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
                          
                          float circleShape(vec2 position, float radius) {
                              float dist = distance(position, vec2(0.5));
                              return step(radius, dist);
                          }
                          
                          
                          void main() {
                              vec2 normalized = vTextureCoord;
                              float value = circleShape(normalized, 0.5);

                              if (value > 0.0)
                                  discard;
                              
                              vec3 color = vec3(1, 0, 0.3);
                              gl_FragColor = vec4(color, 1);
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
  points: Float32Vector2[]
  prevPathBuf: Float32Vector2[]

  public constructor(gl: GL) {
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
    this.points = []
    this.prevPathBuf = []
  }

  init(gl: GL, appState: Readonly<AppState>) {
    bindAll(gl, this, false);

    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .build(gl);

    fillEbo(gl, this.indexBuffer);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    initShader(gl, this.shader);

    appState.toolState.tools['brush'].subscribeToOnBrushStrokeContinued((p) => this.points = p)
    appState.toolState.tools['brush'].subscribeToOnBrushStrokeEnd(_ => {
      gl.clearColor(0, 0, 0, 0);
      //gl.colorMask(true, true, true, false);
      gl.clear(gl.COLOR_BUFFER_BIT);
    })

    unBindAll(gl, this);
  }

  render(gl: GL, state: Readonly<AppState>) {
    bindAll(gl, this);

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const pointsToRender = this.points.length
    if (pointsToRender <= 1) return;

    const smoothed = this.points.splice(0, pointsToRender);

    // const smoothed = processPath({
    //   path: poppe,
    //   prevPathBuf: this.prevPathBuf,
    //   minDistanceBetween: 0.01,
    //   stabilization: 1.0,
    //   alpha: 1.0,
    //   maxPrevPoints: MAX_PREV_POINTS,
    // });

    const buf = new Float32Array(smoothed.length * 6 * VERTEX_SIZE);
    let i = 0;
    for (const p of smoothed) {
      const quadVerts = constructQuadSixTex(p, 0.01);
      for (const v of quadVerts) {
        buf[i++] = v.x;
        buf[i++] = v.y;
      }
    }

    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadMatrix4x4(gl, 'model', state.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', state.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(gl, 'projection', state.canvasState.camera.getProjectionMatrix());
    gl.drawArrays(gl.TRIANGLES, 0, 6 * smoothed.length);

    unBindAll(gl, this);
  }
}
