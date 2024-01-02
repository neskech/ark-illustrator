import { Option } from '../../general/option';
import { GLObject, type GL } from './glUtils';

type AttributeType = 'float' | 'integer';

const attribTypeToGl = (t: AttributeType, gl: GL) => {
  if (t === 'float') return gl.FLOAT;
  else return gl.INT;
};

const ATTRIBUTE_SIZE = 4; //both float and integer are 4 bytes

type IncrementalTypeData = {
  typeSize: number;
  numElements: number;
  typeName: AttributeType;
  attributeName: string;
};

type VAOid = GLObject<WebGLVertexArrayObject>;

export class VaoBuilder {
  private typeData: IncrementalTypeData[];
  private vertexArray: VertexArrayObject;

  constructor(vertexArray: VertexArrayObject) {
    this.vertexArray = vertexArray;
    this.typeData = [];
  }

  addAttribute(
    numElements: number,
    typeName: AttributeType = 'float',
    attributeName = 'unknown'
  ): VaoBuilder {
    this.typeData.push({
      typeSize: ATTRIBUTE_SIZE,
      numElements,
      typeName: typeName,
      attributeName,
    });
    return this;
  }

  build(gl: GL): VertexArrayObject {
    const vertexSizeBytes = this.typeData.reduce(
      (acc, { typeSize, numElements }) => acc + typeSize * numElements,
      0
    );

    let byteOffset = 0;
    for (let i = 0; i < this.typeData.length; i++) {
      const { typeSize, numElements, typeName } = this.typeData[i];

      gl.vertexAttribPointer(
        i,
        numElements,
        attribTypeToGl(typeName, gl),
        false,
        vertexSizeBytes,
        byteOffset
      );

      gl.enableVertexAttribArray(i);
      byteOffset += typeSize * numElements;
    }

    this.vertexArray.setDebugData(this.typeData);
    return this.vertexArray;
  }
}

export class VertexArrayObject {
  private id: VAOid;
  private debugData: IncrementalTypeData[] | null;

  constructor(gl: GL) {
    this.debugData = null;
    const vId = Option.fromNull(gl.createVertexArray());
    const glId = new GLObject(vId.expect("couldn't create new vertex array object"));
    this.id = glId;
  }

  builder(): VaoBuilder {
    return new VaoBuilder(this);
  }

  log(logger: (s: string) => void = console.log): void {
    const s: string =
      this.debugData?.reduce((acc, curr) => {
        return `${acc} {
          typeSize: ${curr.typeSize},
          numElements: ${curr.numElements},
          typeName: ${curr.typeName},
          attributeName: ${curr.attributeName}
        }`;
      }, '') ?? '';

    logger(s);
  }

  setDebugData(data: IncrementalTypeData[]) {
    this.debugData = data;
  }

  bind(gl: GL) {
    gl.bindVertexArray(this.id.innerId())
  }

  unBind(gl: GL) {
    gl.bindVertexArray(null)
  }

  destroy(gl: GL): void {
    this.id.destroy((id) => {
      gl.deleteVertexArray(id)
    });
  }
}
