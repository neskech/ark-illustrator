import { type Option } from "../func/option";
import type FrameBuffer from "./frameBuffer";
import { type GL } from './glUtils';
import { type VertexArrayObject } from "./vertexArray";
import type Buffer from "./buffer";
import type Shader from "./shader";

type PipelineFn = (
  gl: GL,
  vao: VertexArrayObject,
  vbo: Buffer,
  ebo?: Buffer
) => void;

interface PipelineData {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  indexBuffer: Option<Buffer>;
  shader: Shader;
  renderTarget: Option<FrameBuffer>;
  renderFn: PipelineFn;
  initFn: PipelineFn;
  benchmarkLogging: boolean
}

export default class RenderPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  indexBuffer: Option<Buffer>;
  shader: Shader;
  renderTarget: Option<FrameBuffer>;
  renderFn: PipelineFn;
  initFn: PipelineFn;
  benchmarkLogging: boolean

  constructor({
    name,
    vertexArray,
    vertexBuffer,
    indexBuffer,
    shader,
    renderTarget,
    renderFn,
    initFn,
    benchmarkLogging
  }: PipelineData) {
    this.name = name;
    this.vertexArray = vertexArray;
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
    this.renderTarget = renderTarget;
    this.shader = shader;
    this.renderFn = renderFn;
    this.initFn = initFn;
    this.benchmarkLogging = benchmarkLogging;
  }

  init(gl: GL) {
    if (this.benchmarkLogging) console.time(`Render pipeline init function for pipeline '${this.name}`)
    
    try {
      this.vertexArray.bind(gl);
      this.vertexBuffer.bind(gl);
      this.indexBuffer.map((b) => b.bind(gl));
      this.renderTarget.map((f) => f.bind(gl));

      if (this.indexBuffer.isSome())
        this.initFn(
          gl,
          this.vertexArray,
          this.vertexBuffer,
          this.indexBuffer.unwrap()
        );
      else this.initFn(gl, this.vertexArray, this.vertexBuffer);

      this.vertexArray.unbind(gl);
      this.vertexBuffer.unBind(gl);
      this.indexBuffer.map((b) => b.unBind(gl));
      this.renderTarget.map((f) => f.unBind(gl));

    } catch (err) {
      const errMsg = `Error in render pipeline '${this.name}' on render stage`;
      if (err instanceof Error)
        throw new Error(`${errMsg}\n\nReason: ${err.message}`);
      throw new Error(errMsg);
    }

    if (this.benchmarkLogging) console.timeEnd(`Render pipeline init for pipeline '${this.name}`)
  }


  render(gl: GL) {
    if (this.benchmarkLogging) console.time(`Render pipeline render function for pipeline '${this.name}`)

    try {
      this.vertexArray.bind(gl);
      this.vertexBuffer.bind(gl);
      this.indexBuffer.map((b) => b.bind(gl));
      this.renderTarget.map((f) => f.bind(gl));
      this.shader.use(gl);

      if (this.indexBuffer.isSome())
        this.renderFn(
          gl,
          this.vertexArray,
          this.vertexBuffer,
          this.indexBuffer.unwrap()
        );
      else this.renderFn(gl, this.vertexArray, this.vertexBuffer);
    
      this.vertexArray.unbind(gl);
      this.vertexBuffer.unBind(gl);
      this.indexBuffer.map((b) => b.unBind(gl));
      this.renderTarget.map((f) => f.unBind(gl));
      this.shader.stopUsing(gl);

    } catch (err) {
      const errMsg = `Error in render pipeline '${this.name}' on init stage`;
      if (err instanceof Error)
        throw new Error(`${errMsg}\n\nReason: ${err.message}`);
      throw new Error(errMsg);
    }

    if (this.benchmarkLogging) console.timeEnd(`Render pipeline render function for pipeline '${this.name}`)
  }
}
