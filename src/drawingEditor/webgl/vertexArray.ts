import { Option } from '../../util/general/option';
import { GLObject, type GL } from './glUtils';
import { type AttributesObject, type VertexAttributes } from './vertexAttributes';

type VAOid = GLObject<WebGLVertexArrayObject>;

export class VertexArrayObject<VertexAttributes_ extends VertexAttributes<AttributesObject>> {
  private id: VAOid;
  private attributes: VertexAttributes_;

  constructor(gl: GL, vertexAttributes: VertexAttributes_) {
    const vId = Option.fromNull(gl.createVertexArray());
    const glId = new GLObject(vId.expect("couldn't create new vertex array object"));
    this.id = glId;
    this.attributes = vertexAttributes;
  }

  public applyAttributes(gl: GL) {
    const attributes = this.attributes.orderedAttributes();
    
    const vertexSizeBytes = attributes.reduce(
      (acc, curr) => acc + curr.attribute.count() * curr.attribute.typeSize(),
      0
    );

    let byteOffset = 0;
    for (const [i, { attribute }] of attributes.enumerate()) {
      console.log(
        i,
        attribute,
        attribute.count(),
        attribute.webGLType(gl) == gl.FLOAT,
        attribute.typeSize(),
        byteOffset,
        this.attributes.orderedAttributes()
      );
      gl.vertexAttribPointer(
        i,
        attribute.count(),
        attribute.webGLType(gl),
        false,
        vertexSizeBytes,
        byteOffset
      );
      gl.enableVertexAttribArray(i);

      byteOffset += attribute.typeSize() * attribute.count();
    }
  }

  log(logger: (s: string) => void = console.log): void {
    let string = '';

    for (const { name, attribute } of this.attributes.orderedAttributes()) {
      string += `
      {
       typeSize: ${attribute.typeSize()},
       numElements: ${attribute.count()},
       typeName: ${attribute.typeName()},
       attributeName: ${name}

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
