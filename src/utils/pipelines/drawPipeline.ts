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
} from './util';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { type AppState } from '../mainRoutine';
import { type BrushPoint, getSizeGivenPressure } from '../canvas/tools/brush';
import { assert } from '../contracts';
import { Float32Vector2 } from 'matrixgl';
import Texture from '../web/texture';

export const MAX_POINTS_PER_FRAME = 1000;
const NUM_VERTICES_QUAD = 4;
const NUM_INDICES_QUAD = 6;
const VERTEX_SIZE = 4;
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
                          
                          uniform sampler2D tex;
                          
                          
                          void main() {
                             //gl_FragColor = vec4(vTextureCoord, 1, 1);//texture2D(tex, vTextureCoord);
                             gl_FragColor = texture2D(tex, vTextureCoord);
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
  brushTexture: Texture;

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

    appState.toolState.tools['brush'].subscribeToOnBrushStrokeContinued((p) =>
      this.render(gl, p, appState)
    );
    appState.toolState.tools['brush'].subscribeToOnBrushStrokeEnd((_) => {
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    });

    unBindAll(gl, this);
  }

  render(gl: GL, points: BrushPoint[], appState: Readonly<AppState>) {
    bindAll(gl, this);

    if (points.length == 0) return;
    assert(points.length < MAX_POINTS_PER_FRAME);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const buf = new Float32Array(points.length * 6 * VERTEX_SIZE);

    const brushSettings = appState.settings.brushSettings[0];

    let i = 0;
    let prevNormal: Float32Vector2 | null = null;
    for (let j = 0; j < points.length - 1; j++) {
      const uvStart = j / ((points.length - 1) / 1)
      const uvEnd = (j + 1) / ((points.length - 1) / 1)

      const [p, quadVerts] = constructQuadSixPressureNormalUV(
        points[j],
        points[j + 1],
        brushSettings,
        prevNormal,
        uvStart,
        uvEnd
      ); //constructLinesSixPressureNormal(points[j], points[j + 1], brushSettings, prevNormal);
      prevNormal = p;
      for (const v of quadVerts) {
        buf[i++] = v.x;
        buf[i++] = v.y;
      }
    }

    this.vertexBuffer.addData(gl, buf);

    this.shader.uploadMatrix4x4(gl, 'model', appState.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', appState.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(
      gl,
      'projection',
      appState.canvasState.camera.getProjectionMatrix()
    );

    this.brushTexture.bind(gl);
    this.shader.uploadTexture(gl, 'tex', this.brushTexture);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * points.length);

    this.brushTexture.unbind(gl);

    unBindAll(gl, this);
  }
}
