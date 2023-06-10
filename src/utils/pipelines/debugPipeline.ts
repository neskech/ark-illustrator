import { type GL } from '../web/glUtils';
import RenderPipeline, {
  type PipelineData,
  type PipelineFn,
} from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import { None } from '../func/option';
import Shader from '../web/shader';

const initFn: PipelineFn = function init(gl, vao, vbo, shader, _) {
  vao.builder().addAttribute(2, 'float', 'position').build(gl);

  const vertexData = new Float32Array([0.0, 0.0, 0.3, 0.3, -0.5, 0.3]);

  vbo.allocateWithData(gl, vertexData);

  const fragmentSource = `void main() {
                            gl_FragColor = vec4(0, 0, 1, 1);
                        }\n`;
  const vertexSource = `  attribute vec2 a_position;
                          uniform mat4 model;
                          uniform mat4 view;
                          uniform mat4 projection;
                          
                          void main() {
                            gl_Position = projection * view * model * vec4(a_position, 0, 1);
                            gl_PointSize = 64.0;
                          }\n`;

  shader.constructFromSource(gl, vertexSource, fragmentSource).match(
    (_) => console.log('debug shader compilation success!'),
    (e) => {
      throw new Error(`Could not compile debug shader...\n\n${e}`);
    }
  );
};

const renderFn: PipelineFn = function render(gl, _, __, shader, state) {
  shader.uploadMatrix4x4(gl, 'model', state.camera.getTransformMatrix());
  shader.uploadMatrix4x4(gl, 'view', state.camera.getViewMatrix());
  shader.uploadMatrix4x4(gl, 'projection', state.camera.getProjectionMatrix());
  gl.drawArrays(gl.TRIANGLES, 0, 3);
};

export default function getDebugPipeline(gl: GL): RenderPipeline {
  const vertexArray: VertexArrayObject = new VertexArrayObject(gl);

  const vertexBuffer: Buffer = new Buffer(gl, {
    btype: 'VertexBuffer',
    usage: 'Static Draw',
  });

  const shader: Shader = new Shader(gl);

  const pipelineOptions: PipelineData = {
    name: 'Debug Pipeline',
    vertexArray,
    vertexBuffer,
    indexBuffer: None(),
    shader,
    renderTarget: None(),
    initFn,
    renderFn,
    benchmarkLogging: false,
  };

  return new RenderPipeline(pipelineOptions);
}
