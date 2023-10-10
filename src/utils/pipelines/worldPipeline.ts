import { type GL } from '../web/glUtils';
import { bindAll, unBindAll } from '../web/renderPipeline';
import { VertexArrayObject } from '../web/vertexArray';
import Buffer from '~/utils/web/buffer';
import Shader from '../web/shader';
import { type AppState } from '../mainRoutine';

function initShader(gl: GL, shader: Shader) {
  const fragmentSource = ``;
  const vertexSource = ``;

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

  init(gl: GL) {
    bindAll(gl, this);

    initShader(gl, this.shader)

    unBindAll(gl, this);
  }

  render(gl: GL, _: Readonly<AppState>) {
    bindAll(gl, this);


    unBindAll(gl, this);
  }
}
