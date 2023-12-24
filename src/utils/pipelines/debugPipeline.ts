import { type GL } from '../web/glUtils';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';
import { constructQuadIndices, constructQuadSixTex } from './util';
import UnitStabilizer from '../canvas/utils/stabilizing/unitStabilizer';
import { type BrushPoint } from '../canvas/tools/brush';
import SmoothedStabilizer from '../canvas/utils/stabilizing/smoothStabilizer';
import EventManager from '../event/eventManager';

const MAX_POINTS_PER_FRAME = 50000;
const NUM_VERTICES_QUAD = 4;
const NUM_INDICES_QUAD = 6;
const VERTEX_SIZE = 4;
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

export class DebugPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  indexBuffer: Buffer;
  shader: Shader;
  linearPoints: BrushPoint[];
  smoothedPoints: BrushPoint[];
  linearStab = new UnitStabilizer();
  smoothedStab = new SmoothedStabilizer();
  currentBuf: 'linear' | 'smoothed' = 'smoothed';

  public constructor(gl: GL, _: Readonly<AppState>) {
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
    this.linearPoints = [];
    this.smoothedPoints = [];
  }

  init(gl: GL, appState: Readonly<AppState>) {
    this.vertexArray
      .builder()
      .addAttribute(2, 'float', 'position')
      .addAttribute(2, 'float', 'texCord')
      .build(gl);

    fillEbo(gl, this.indexBuffer);

    const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * SIZE_FLOAT;
    this.vertexBuffer.allocateWithData(gl, new Float32Array(verticesSizeBytes));

    initShader(gl, this.shader);

    EventManager.subscribe('brushStrokeContinuedRaw', (p) => {
      this.smoothedPoints = this.smoothedStab.getProcessedCurveWithPoints(p, 1, 1, 1);
      this.linearPoints = this.linearStab.getProcessedCurveWithPoints(p);

      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const pointsToRender =
        this.currentBuf == 'smoothed' ? this.smoothedPoints : this.linearPoints;
      this.render(gl, pointsToRender, appState);
    });

    EventManager.subscribe('brushStrokEnd', (_) => {
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.smoothedPoints = [];
      this.linearPoints = [];
    });

    this.addEvents(gl, appState);
  }

  private render(gl: GL, pointsToRender: BrushPoint[], state: Readonly<AppState>) {
    if (pointsToRender.length <= 1) return;

    const buf = new Float32Array(pointsToRender.length * 6 * VERTEX_SIZE);

    let i = 0;
    for (const p of pointsToRender) {
      const quadVerts = constructQuadSixTex(p.position, 0.01);
      for (const v of quadVerts) {
        buf[i++] = v.x;
        buf[i++] = v.y;
      }
    }

    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadMatrix4x4(gl, 'model', state.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', state.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(gl, 'projection', state.canvasState.camera.getProjectionMatrix());

    gl.drawArrays(gl.TRIANGLES, 0, 6 * pointsToRender.length);
  }

  private addEvents(gl: GL, appState: Readonly<AppState>) {
    document.addEventListener('keypress', (e) => {
      if (e.key == 'j') {
        this.currentBuf = this.currentBuf == 'linear' ? 'smoothed' : 'linear';
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const pointsToRender =
          this.currentBuf == 'smoothed' ? this.smoothedPoints : this.linearPoints;
        this.render(gl, pointsToRender, appState);
      }
    });
  }
}
