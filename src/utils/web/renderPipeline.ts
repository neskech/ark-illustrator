import type FrameBuffer from './frameBuffer';
import { type GL } from './glUtils';
import { type VertexArrayObject } from './vertexArray';
import type Buffer from './buffer';
import type Shader from './shader';

export interface RenderPipeline {
  name: string;
  vertexArray: VertexArrayObject;
  vertexBuffer: Buffer;
  indexBuffer?: Buffer;
  shader: Shader;
  renderTarget?: FrameBuffer;
}

export function bindAll(gl: GL, pipeline: RenderPipeline) {
  pipeline.vertexArray.bind(gl);
  pipeline.vertexBuffer.bind(gl);
  pipeline.indexBuffer?.bind(gl)
  pipeline.renderTarget?.bind(gl)
}

export function unBindAll(gl: GL, pipeline: RenderPipeline) {
  pipeline.vertexArray.unBind(gl);
  pipeline.vertexBuffer.unBind(gl);
  pipeline.indexBuffer?.unBind(gl)
  pipeline.renderTarget?.unBind(gl)
}

export function destroyAll(gl: GL, pipeline: RenderPipeline) {
  pipeline.vertexArray.destroy(gl);
  pipeline.vertexBuffer.destroy(gl);
  pipeline.indexBuffer?.destroy(gl)
  pipeline.shader.destroy(gl)
  pipeline.renderTarget?.destroy(gl)
}

export function initWithErrorWrapper(
  f: () => void,
  pipelineName: string,
  enableLogging = false
) {
  if (enableLogging)
    console.time(`Render pipeline init function for pipeline '${pipelineName}`);

  try {
    f();
  } catch (err) {
    const errMsg = `Error in render pipeline '${pipelineName}' on init stage`;
    if (err instanceof Error) {
      err.message = `${errMsg} -- ${err.message}`;
      throw err;
    }
    throw new Error(errMsg);
  }

  if (enableLogging)
    console.timeEnd(`Render pipeline init function for pipeline '${pipelineName}`);
}

export function renderWithErrorWrapper(
  f: () => void,
  pipelineName: string,
  enableLogging = false
) {
  if (enableLogging)
    console.time(`Render pipeline render function for pipeline '${pipelineName}`);

  try {
    f();
  } catch (err) {
    const errMsg = `Error in render pipeline '${pipelineName}' on render stage`;
    if (err instanceof Error) {
      err.message = `${errMsg} -- ${err.message}`;
      throw err;
    }
    throw new Error(errMsg);
  }

  if (enableLogging)
    console.timeEnd(`Render pipeline render function for pipeline '${pipelineName}`);
}
