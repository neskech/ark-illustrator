import { type Option } from "../func/option";
import { type VertexArrayObject } from './vertexArray';

type PipelineFn = (vao: VertexArrayObject, vbo: Buffer, ebo?: Buffer) => void;

//TODO: Helpers for rendering should handle the binding for us
interface PipelineData {
    name: string,
    vertexArray: VertexArrayObject,
    vertexBuffer: Buffer,
    indexBuffer: Option<Buffer>,
    target: Option<FrameBuffer>,
    renderFn: PipelineFn,
    initFn: PipelineFn
}

export default class RenderPipeline {
    name: string
    vertexArray: VertexArrayObject
    vertexBuffer: Buffer
    indexBuffer: Option<Buffer>
    renderFn: PipelineFn
    initFn: PipelineFn

    constructor({name, vertexArray, vertexBuffer, indexBuffer, renderFn, initFn}: PipelineData) {
        this.name = name;
        this.vertexArray = vertexArray;
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
        this.renderFn = renderFn;
        this.initFn = initFn;
    }

    init() {
        try {
            if (this.indexBuffer.isSome())
              this.initFn(this.vertexArray, this.vertexBuffer, this.indexBuffer.unwrap());
            else
              this.initFn(this.vertexArray, this.vertexBuffer);
        } catch (err) {
            //TODO: extract err msg and rethrow
        }
    }

    render() {
        try {
            if (this.indexBuffer.isSome())
              this.renderFn(this.vertexArray, this.vertexBuffer, this.indexBuffer.unwrap());
            else
              this.renderFn(this.vertexArray, this.vertexBuffer);
        } catch (err) {
            //TODO: extract err msg and rethrow
        }
    }
}