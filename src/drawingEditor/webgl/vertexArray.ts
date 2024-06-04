import { Option } from '../../util/general/option';
import { GLObject, type GL } from './glUtils';
import { type VertexAttributes } from './vertexAttributes';


type VAOid = GLObject<WebGLVertexArrayObject>;

export class VertexArrayObject {
  private id: VAOid;
  private attributes: VertexAttributes;

  constructor(gl: GL, vertexAttributes: VertexAttributes) {
    const vId = Option.fromNull(gl.createVertexArray());
    const glId = new GLObject(vId.expect("couldn't create new vertex array object"));
    this.id = glId;
    this.attributes = vertexAttributes;

    this.initialize(gl)
  }

  private initialize(gl: GL) {
    let byteOffset = 0;

    for (const [i, attribute] of Object.values(this.attributes).enumerate()) {
      gl.vertexAttribPointer(
        i,
        attribute.count,
        attribute.webGLType(gl),
        false,
        attribute.typeSize(),
        byteOffset
      );
      gl.enableVertexAttribArray(i);
      
      byteOffset += attribute.typeSize() * attribute.count
    }

  }

  log(logger: (s: string) => void = console.log): void {
    let string = '';

    for (const [attributeName, attribute] of Object.entries(this.attributes)) {
      string += `
      {
       typeSize: ${attribute.typeSize()},
       numElements: ${attribute.count},
       typeName: ${attribute.typeName},
       attributeName: ${attributeName}

      }`;
    }

    logger(string);
  }

  bind(gl: GL) {
    gl.bindVertexArray(this.id.innerId());
  }

  unBind(gl: GL) {
    gl.bindVertexArray(null);
  }

  destroy(gl: GL): void {
    this.id.destroy((id) => {
      gl.deleteVertexArray(id);
    });
  }
}
