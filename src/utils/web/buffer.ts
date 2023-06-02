/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { unreachable } from "../func/funUtils";
import { Option } from "../func/option";
import { type GL, GLObject, glOpErr } from "./glUtils";

type BufferType = 'IndexBuffer' | 'VertexBuffer' | 'Uniform Buffer';
type Usage = 'Static Draw' | 'Dynamic Draw' | 'Stream Draw'

function bufTypeToEnum(gl: GL, t: BufferType): GLenum {
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

function usageToEnum(gl: GL, t: Usage): GLenum {
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default class Buffer {
  private id: GLObject<WebGLBuffer>;
  private bufType: BufferType;
  private autoResizing: boolean;
  private usage: Usage;
  private sizeBytes;

  constructor(gl: GL, bufType_: BufferType, usage_: Usage = 'Static Draw', autoResizing_ = false) {
    const bId = Option.fromNull(glOpErr(gl, gl.createBuffer.bind(this)));
    const gId = bId.expect("Couldn't create vertex buffer");
    this.id = new GLObject(gId);

    this.bufType = bufType_;
    this.autoResizing = autoResizing_;
    this.usage = usage_;
    this.sizeBytes = 0;
  }

  bind(gl: GL) {
    const target = bufTypeToEnum(gl, this.bufType);
    glOpErr(gl, gl.bindBuffer.bind(this), target, this.id.innerId());
  }

  unBind(gl: GL) {
    const target = bufTypeToEnum(gl, this.bufType);
    glOpErr(gl, gl.bindBuffer.bind(this), target, 0);
  }

  preallocate(gl: GL, size: number) {
     const target = bufTypeToEnum(gl, this.bufType);
     const usage = usageToEnum(gl, this.usage);
     this.sizeBytes = size;

     function bufferEmptyData() {
        gl.bufferData(target, size, usage);
     }

     glOpErr(gl, bufferEmptyData); 
  }

  resize(gl: GL, size: number) {
    const target = bufTypeToEnum(gl, this.bufType);
    const usage = usageToEnum(gl, this.usage);
    this.sizeBytes = size;

    function bufferEmptyData() {
       gl.bufferData(target, size, usage);
    }

    glOpErr(gl, bufferEmptyData); 
  }

  addData(gl: GL, data: ArrayBufferView, offsetBytes = 0) {
    const target = bufTypeToEnum(gl, this.bufType);
    const usage = usageToEnum(gl, this.usage);

    const endIndex = offsetBytes + data.byteLength;
    if (endIndex >= this.sizeBytes && this.autoResizing) 
        this.resize(gl, endIndex);
    else if (endIndex >= this.sizeBytes && !this.autoResizing)
        throw new Error(`Out of bounds write on gl buffer.\n 
                         Data Size Bytes: ${data.byteLength}\n
                         Data Write Offset Bytes: ${offsetBytes}\n
                         End Index BytesL ${endIndex}\n
                         Current Buffer Size Bytes: ${this.sizeBytes}\n\n                         
                         Entire buffer::\n
                         ${this.toString()}`)
    

    glOpErr(gl, gl.bufferSubData.bind(this), target, data, usage, offsetBytes); 
  }

  toString(): string {
     return `GL custom buffer --\n
             Buffer Type: ${this.bufType}\n
             Usage: ${this.usage}\n
             Auto Resizing: ${this.autoResizing}\n
             Size in Bytes: ${this.sizeBytes}`
  }

  log(logger: (s: string) => void) {
    logger(this.toString())
  }

  destroy(gl: GL) {
    this.id.destroy((id) => {
      glOpErr(gl, gl.deleteBuffer.bind(this), id);
    })
  }
}

export class PixelBuffer extends Buffer {
  //TODO
}