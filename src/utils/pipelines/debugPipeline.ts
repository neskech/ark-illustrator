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

const NUM_VERTICES_QUAD = 4;
const NUM_INDICES_QUAD = 6;
const SIZE_INTEGER = 4;
const SIZE_FLOAT = 4;

const initFn: PipelineFn = function init(gl, _, vbo, shader) {
  const vertexData = [

  ]

  shader
  .construct(gl, 'debug')
  .then(() => console.info('Success compiling draw shader'))
  .catch((msg) => {
    throw new Error(msg as string);
  });
};

const renderFn: PipelineFn = function render(gl, _, vbo, shdaer) {

};

export default function getDrawPipeline(gl: GL): RenderPipeline {
  const vertexArray: VertexArrayObject = VertexArrayObject.new(gl)
    .addAttribute(2, 'integer', 'position')
    .build(gl);

  const vertexBuffer: Buffer = new Buffer(gl, {
    btype: 'VertexBuffer',
    usage: 'Static Draw',
  });

  const shader: Shader = new Shader(gl);

  const pipelineOptions: PipelineData = {
    name: 'Standard Draw Pipeline',
    vertexArray,
    vertexBuffer,
    indexBuffer: None(),
    shader,
    renderTarget: None(),
    initFn,
    renderFn,
    benchmarkLogging: true,
  };

  return new RenderPipeline(pipelineOptions);
}
