/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { unreachable } from '../general/funUtils';
import { Option } from '../general/option';
import { gl } from '../../drawingEditor/application';
import { GLObject } from './glUtils';

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! TYPES
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

type BufferType = 'IndexBuffer' | 'VertexBuffer' | 'Uniform Buffer';
type Usage = 'Static Draw' | 'Dynamic Draw' | 'Stream Draw';

export interface BufferOptions {
  btype: BufferType;
  usage?: Usage;
  autoResizing?: boolean;
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! CLASS DEFINITION
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default class GLBuffer {
  private id: GLObject<WebGLBuffer>;
  private bufType: BufferType;
  private autoResizing: boolean;
  private usage: Usage;
  private sizeBytes;

  constructor({ btype, usage, autoResizing }: BufferOptions) {
    const bId = Option.fromNull(gl.createBuffer());
    const gId = bId.expect("Couldn't create vertex buffer");
    this.id = new GLObject(gId, 'buffer');

    this.bufType = btype;
    this.usage = usage ?? 'Static Draw';
    this.autoResizing = autoResizing ?? false;
    this.sizeBytes = 0;
  }

  preallocate(sizeBytes: number) {
    const target = bufTypeToEnum(this.bufType);
    const usage = usageToEnum(this.usage);
    this.sizeBytes = sizeBytes;

    gl.bufferData(target, sizeBytes, usage);
  }

  allocateWithData(data: ArrayBufferView, srcOffset = 0) {
    const target = bufTypeToEnum(this.bufType);
    const usage = usageToEnum(this.usage);
    this.sizeBytes = data.byteLength;

    gl.bufferData(target, data, usage, srcOffset);
  }

  resize(size: number) {
    const target = bufTypeToEnum(this.bufType);
    const usage = usageToEnum(this.usage);
    this.sizeBytes = size;

    gl.bufferData(target, size, usage);
  }

  addData(data: ArrayBufferView, dstOffsetBytes = 0, srcOffsetBytes = 0) {
    const target = bufTypeToEnum(this.bufType);

    const endIndex = srcOffsetBytes + data.byteLength - 1;
    if (endIndex >= this.sizeBytes && this.autoResizing) this.resize(endIndex);
    else if (endIndex >= this.sizeBytes && !this.autoResizing && this.sizeBytes != 0)
      throw new Error(`Out of bounds write on gl buffer.\n 
      Data Size Bytes: ${data.byteLength}\n
      Data Write Offset Bytes: ${srcOffsetBytes}\n
      End Index BytesL ${endIndex}\n
      Current Buffer Size Bytes: ${this.sizeBytes}\n\n                         
      Entire buffer::\n
      ${this.toString()}`);

    gl.bufferSubData(target, dstOffsetBytes, data, srcOffsetBytes);
  }

  bind() {
    const target = bufTypeToEnum(this.bufType);
    gl.bindBuffer(target, this.id.innerId());
  }

  unBind() {
    const target = bufTypeToEnum(this.bufType);
    gl.bindBuffer(target, null);
  }

  toString(): string {
    return `GL custom buffer --\n
    Buffer Type: ${this.bufType}\n
    Usage: ${this.usage}\n
    Auto Resizing: ${this.autoResizing}\n
    Size in Bytes: ${this.sizeBytes}`;
  }

  destroy() {
    this.id.destroy((id) => {
      gl.deleteBuffer(id);
    });
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function bufTypeToEnum(t: BufferType): GLenum {
  switch (t) {
    case 'IndexBuffer':
      return gl.ELEMENT_ARRAY_BUFFER;
    case 'VertexBuffer':
      return gl.ARRAY_BUFFER;
    case 'Uniform Buffer':
      return gl.UNIFORM_BUFFER;
    default:
      return unreachable();
  }
}

function usageToEnum(t: Usage): GLenum {
  switch (t) {
    case 'Static Draw':
      return gl.STATIC_DRAW;
    case 'Dynamic Draw':
      return gl.DYNAMIC_DRAW;
    case 'Stream Draw':
      return gl.STREAM_DRAW;
    default:
      return unreachable();
  }
}
