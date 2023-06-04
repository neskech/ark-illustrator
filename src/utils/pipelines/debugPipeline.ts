import { type GL } from '../web/glUtils';
import RenderPipeline, {
  type PipelineData,
  type PipelineFn,
} from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import { None } from '../func/option';
import Shader from '../web/shader';

const initFn: PipelineFn = function init(gl, _, vbo, shader) {
  const vertexData = new Float32Array([
    0.5, 0.5,
    0.9, 0.9,
    -0.5, 0.9
  ]);

  vbo.addData(gl, vertexData);

  shader
  .construct(gl, 'debug')
  .then(() => console.info('Success compiling debug shader'))
  .catch((msg) => {
    throw new Error(msg as string);
  });
};

const renderFn: PipelineFn = function render(gl, _, __, ___) {
    gl.drawArrays(gl.TRIANGLES, 0, 1);
};

export default function getDebugPipeline(gl: GL): RenderPipeline {
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
