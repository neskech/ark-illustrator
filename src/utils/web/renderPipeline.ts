import { type Option } from '../func/option';
import type FrameBuffer from './frameBuffer';
import { type GL } from './glUtils';
import { type VertexArrayObject } from './vertexArray';
import type Buffer from './buffer';
import type Shader from './shader';
import { type CanvasState } from '../canvas/canvas';

export type PipelineFn = (
  gl: GL,
  vao: VertexArrayObject,
  vbo: Buffer,
  shader: Shader,
  state: CanvasState,
  target?: FrameBuffer,
  ebo?: Buffer,
) => void;

export interface PipelineData {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  indexBuffer: Option<Buffer>;
  shader: Shader;
  renderTarget: Option<FrameBuffer>;
  renderFn: PipelineFn;
  initFn: PipelineFn;
  benchmarkLogging: boolean;
}

export default class RenderPipeline {
  private name: string;
  private vertexArray: VertexArrayObject;
  private vertexBuffer: Buffer;
  private indexBuffer: Option<Buffer>;
  private shader: Shader;
  private renderTarget: Option<FrameBuffer>;
  private renderFn: PipelineFn;
  private initFn: PipelineFn;
  private benchmarkLogging: boolean;

  constructor({
    name,
    vertexArray,
    vertexBuffer,
    indexBuffer,
    shader,
    renderTarget,
    renderFn,
    initFn,
    benchmarkLogging,
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

  init(gl: GL, canvasState: CanvasState) {
    if (this.benchmarkLogging)
      console.time(`Render pipeline init function for pipeline '${this.name}`);

    try {
      this.vertexArray.bind(gl);
      this.vertexBuffer.bind(gl);
      this.indexBuffer.map((b) => b.bind(gl));

      this.initFn(
        gl,
        this.vertexArray,
        this.vertexBuffer,
        this.shader,
        canvasState,
        this.renderTarget.isSome() ? this.renderTarget.unwrap() : undefined,
        this.indexBuffer.isSome() ? this.indexBuffer.unwrap() : undefined
      );

      this.vertexBuffer.unBind(gl);
      this.indexBuffer.map((b) => b.unBind(gl));
      this.vertexArray.unBind(gl);

    } catch (err) {
      const errMsg = `Error in render pipeline '${this.name}' on init stage`;
      if (err instanceof Error) {
        err.message = `${errMsg} -- ${err.message}`
        throw err;
      }
      throw new Error(errMsg);
    }

    if (this.benchmarkLogging)
      console.timeEnd(`Render pipeline init for pipeline '${this.name}`);
  }

  render(gl: GL, canvasState: CanvasState) {
    if (this.benchmarkLogging)
      console.time(
        `Render pipeline render function for pipeline '${this.name}`
      );

    try {
      this.vertexArray.bind(gl);
      this.vertexBuffer.bind(gl);
      this.indexBuffer.map((b) => b.bind(gl));
      this.renderTarget.map((f) => f.bind(gl));
      this.shader.use(gl);

      this.renderFn(
        gl,
        this.vertexArray,
        this.vertexBuffer,
        this.shader,
        canvasState,
        this.renderTarget.isSome() ? this.renderTarget.unwrap() : undefined,
        this.indexBuffer.isSome() ? this.indexBuffer.unwrap() : undefined
      );

      this.vertexArray.unBind(gl);
      this.vertexBuffer.unBind(gl);
      this.indexBuffer.map((b) => b.unBind(gl));
      this.renderTarget.map((f) => f.unBind(gl));
      this.shader.stopUsing(gl);
    } catch (err) {
      const errMsg = `Error in render pipeline '${this.name}' on render stage`;
      if (err instanceof Error) {
        err.message = `${errMsg} -- ${err.message}`
        throw err;
      }
      throw new Error(errMsg);
    }

    if (this.benchmarkLogging)
      console.timeEnd(
        `Render pipeline render function for pipeline '${this.name}`
      );
  }

  destroy(gl: GL) {
    this.vertexArray.destroy(gl);
    this.vertexBuffer.destroy(gl);
    this.shader.destroy(gl);
    this.indexBuffer.map((b) => b.destroy(gl));
    this.renderTarget.map((f) => f.destroy(gl));
  }
}
