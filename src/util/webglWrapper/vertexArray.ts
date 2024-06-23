import { Option } from '../general/option';
import { gl } from '../../drawingEditor/application';
import { GLObject } from './glUtils';
import { type AttributesObject, type VertexAttributes } from './vertexAttributes';

export class VertexArrayObject<T extends AttributesObject> {
  private id: GLObject<WebGLVertexArrayObject>;
  private attributes: VertexAttributes<T>;

  constructor(vertexAttributes: VertexAttributes<T>) {
    const vId = Option.fromNull(gl.createVertexArray());
    const glId = new GLObject(vId.expect("couldn't create new vertex array object"));
    this.id = glId;
    this.attributes = vertexAttributes;
  }

  public applyAttributes() {
    const attributes = this.attributes.orderedAttributes();

    const vertexSizeBytes = attributes.reduce(
      (acc, curr) => acc + curr.attribute.count() * curr.attribute.typeSize(),
      0
    );

    let byteOffset = 0;
    for (const [i, { attribute }] of attributes.enumerate()) {
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

  bind() {
    gl.bindVertexArray(this.id.innerId());
  }

  unBind() {
    gl.bindVertexArray(null);
  }

  destroy(): void {
    this.id.destroy((id) => {
      gl.deleteVertexArray(id);
    });
  }
}
