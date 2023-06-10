import { type GL } from '../web/glUtils';
import RenderPipeline, {
  type PipelineData,
  type PipelineFn,
} from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import { None, Option, Some } from '../func/option';
import Shader from '../web/shader';
import { constructQuadIndices, constructQuadSix, constructQuadSixTex } from './pipelines';
import { Path } from '../canvas/tools/brush';
import { Float32Vector2 } from 'matrixgl';

const MAX_POINTS_PER_FRAME = 500;
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

const initFn: PipelineFn = function init(gl, vao, vbo, shader, _, __, ebo) {
  vao
    .builder()
    .addAttribute(2, 'float', 'position')
    .addAttribute(2, 'float', 'texCord')
    .build(gl);

  const indexBuffer = Option.fromNull(ebo).expect(
    'Index buffer should be defined in init function'
  );
  fillEbo(gl, indexBuffer);

  const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * SIZE_FLOAT;
  vbo.allocateWithData(gl, new Float32Array(verticesSizeBytes));

  const fragmentSource = `precision highp float;
  uniform vec2 u_resolution;

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

       vec3 color = vec3(value, 0, 0.3);
       gl_FragColor = vec4(color, 1);
  }\n`;
  const vertexSource = `  attribute vec2 a_position;
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
};

const renderFn: PipelineFn = function render(gl, _, vbo, shader, state, __, ebo) {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const pointsToRender = Math.min(MAX_POINTS_PER_FRAME, state.pointBuffer.length);
  if (pointsToRender == 0) return;

  const popped = state.pointBuffer.splice(0, pointsToRender);

  const buf = new Float32Array(pointsToRender * 6 * VERTEX_SIZE);
  let i = 0;
  for (const p of popped) {
    const quadVerts = constructQuadSixTex(p, 0.1);
    for (const v of quadVerts) {
      buf[i++] = v.x;
      buf[i++] = v.y;
    }
  }

  vbo.addData(gl, buf);

  shader.uploadMatrix4x4(gl, 'model', state.camera.getTransformMatrix());
  shader.uploadMatrix4x4(gl, 'view', state.camera.getViewMatrix());
  shader.uploadMatrix4x4(gl, 'projection', state.camera.getProjectionMatrix());
  shader.uploadFloatVec2(
    gl,
    'u_resolution',
    new Float32Vector2(state.canvasWidth, state.canvasHeight)
  );
  gl.drawArrays(gl.TRIANGLES, 0, 6);
};

export default function getDrawPipeline(gl: GL): RenderPipeline {
  const vertexArray: VertexArrayObject = new VertexArrayObject(gl);

  const vertexBuffer: Buffer = new Buffer(gl, {
    btype: 'VertexBuffer',
    usage: 'Static Draw',
  });

  const indexBuffer: Buffer = new Buffer(gl, {
    btype: 'IndexBuffer',
    usage: 'Static Draw',
  });

  const shader: Shader = new Shader(gl);

  const pipelineOptions: PipelineData = {
    name: 'Standard Draw Pipeline',
    vertexArray,
    vertexBuffer,
    indexBuffer: Some(indexBuffer),
    shader,
    renderTarget: None(),
    initFn,
    renderFn,
    benchmarkLogging: false,
  };

  return new RenderPipeline(pipelineOptions);
}
