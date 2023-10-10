import { type GL } from '../web/glUtils';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';

export class DebugPipeline {
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

  init(gl: GL) {
    bindAll(gl, this);

    this.vertexArray.builder().addAttribute(2, 'float', 'position').build(gl);

    const vertexData = new Float32Array([0.0, 0.0, 0.3, 0.3, -0.5, 0.3]);

    this.vertexBuffer.allocateWithData(gl, vertexData);

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

    this.shader.constructFromSource(gl, vertexSource, fragmentSource).match(
      (_) => console.log('debug shader compilation success!'),
      (e) => {
        throw new Error(`Could not compile debug shader...\n\n${e}`);
      }
    );

    unBindAll(gl, this);
  }

  render(gl: GL, state: Readonly<AppState>) {
    bindAll(gl, this);

    this.shader.uploadMatrix4x4(gl, 'model', state.canvasState.camera.getTransformMatrix());
    this.shader.uploadMatrix4x4(gl, 'view', state.canvasState.camera.getViewMatrix());
    this.shader.uploadMatrix4x4(gl, 'projection', state.canvasState.camera.getProjectionMatrix());
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    unBindAll(gl, this);
  }
}
