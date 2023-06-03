import { type GL } from '../web/glUtils';
import RenderPipeline, {
  type PipelineData,
  type PipelineFn,
} from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import { None, Option, Some } from '../func/option';
import Shader from '../web/shader';
import { constructQuadIndices } from './pipelines';
import { isUint32Array } from 'util/types';

const MAX_POINTS_PER_FRAME = 500;
const NUM_VERTICES_QUAD = 4;
const NUM_INDICES_QUAD = 6;
const SIZE_INTEGER = 4;
const SIZE_FLOAT = 4;

function fillEbo(gl: GL, ebo: Buffer) {
    const buf = new Uint32Array(MAX_POINTS_PER_FRAME * NUM_INDICES_QUAD);

    const numQuads = MAX_POINTS_PER_FRAME;
    for (let i = 0; i < numQuads; i++) {
        const indexOffset = i * NUM_INDICES_QUAD;
        const indices = constructQuadIndices(indexOffset);

        for (let j = 0; j < indices.length; j++) 
            buf[indexOffset + j] = indices[j]
    }

    ebo.addData(gl, buf);
}

const initFn: PipelineFn = function init(gl, vao, vbo, shader, _, ebo) {
  const indexBuffer = Option.fromNull(ebo).expect(
    'Index buffer should be defined in init function'
  );
  fillEbo(gl, indexBuffer);

  const verticesSizeBytes = MAX_POINTS_PER_FRAME * NUM_VERTICES_QUAD * SIZE_FLOAT;
  vbo.preallocate(gl, verticesSizeBytes);

  shader
  .construct(gl, 'draw')
  .then(() => console.info('Success compiling draw shader'))
  .catch((msg) => {
    throw new Error(msg as string);
  });
};

const renderFn: PipelineFn = function render(gl, _, vbo, shdaer, __, ebo) {

};

export default function getDrawPipeline(gl: GL): RenderPipeline {
  const vertexArray: VertexArrayObject = VertexArrayObject.new(gl)
    .addAttribute(2, 'integer', 'position')
    .build(gl);

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
    benchmarkLogging: true,
  };

  return new RenderPipeline(pipelineOptions);
}
