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

    this.initialize(gl)
  }

  private initialize(gl: GL) {
    let byteOffset = 0;

    for (const [i, {attribute}] of this.attributes.orderedAttributes().enumerate()) {
      gl.vertexAttribPointer(
        i,
        attribute.count(),
        attribute.webGLType(gl),
        false,
        attribute.typeSize(),
        byteOffset
      );
      gl.enableVertexAttribArray(i);
      
      byteOffset += attribute.typeSize() * attribute.count()
    }

  }

  log(logger: (s: string) => void = console.log): void {
    let string = '';

    for (const {name, attribute} of this.attributes.orderedAttributes()) {
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
