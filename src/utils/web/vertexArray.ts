import { Option } from "../func/option";
import { GLObject, type GL, glOpErr } from "./glUtils";

type AttributeType = "float" | "integer";

const attribTypeToGl = (t: AttributeType, gl: GL) => {
  if (t === "float") return gl.FLOAT;
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
  private id: VAOid;

  constructor(glId: VAOid) {
    this.id = glId;
    this.typeData = [];
  }

  addAttribute(
    numElements: number,
    typeName: AttributeType = "float",
    attributeName = "unknown"
  ) {
    this.typeData.push({
      typeSize: ATTRIBUTE_SIZE,
      numElements,
      typeName: typeName,
      attributeName,
    });
  }

  build(gl: GL): VertexArrayObject {
    const vertexSizeBytes = this.typeData.reduce(
      (acc, { typeSize }) => acc + typeSize,
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
      byteOffset += typeSize;
    }

    return new VertexArrayObject(this.id, this.typeData);
  }
}

export class VertexArrayObject {
  private id: VAOid;
  private debugData: IncrementalTypeData[];

  static new(gl: GL): VaoBuilder {
    const vId = Option.fromNull(glOpErr(gl, gl.createVertexArray.bind(this)));
    const glId = new GLObject(vId.expect('couldn\'t create new vertex array object'));
    return new VaoBuilder(glId);
  }

  constructor(id_: VAOid, typeData: IncrementalTypeData[]) {
    this.id = id_;
    this.debugData = typeData;
  }

  log(logger: (s: string) => void = console.log): void {
    const s: string = this.debugData.reduce((acc, curr) => {
      return `${acc} {
          typeSize: ${curr.typeSize},
          numElements: ${curr.numElements},
          typeName: ${curr.typeName},
          attributeName: ${curr.attributeName}
        }`;
    }, "");

    logger(s);
  }

  destroy(gl: GL): void {
    this.id.destroy((id) => {
      glOpErr(gl, gl.deleteVertexArray.bind(this), id);
    });
  }
}
