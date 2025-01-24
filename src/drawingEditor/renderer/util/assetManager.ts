import { assert, requires } from '~/util/general/contracts';
import { Err, Ok, Result, unit, type Unit } from '~/util/general/result';
import Shader from '../../../util/webglWrapper/shader';
import type Texture from '../../../util/webglWrapper/texture';
import { TextureCreator } from '../../../util/webglWrapper/texture';

interface ShaderManifest {
  shaders: string[];
}
interface TextureManifest {
  textures: string[];
}
export default class AssetManager {
  private shaderMap: Map<string, Shader>;
  private textureMap: Map<string, Texture>;

  constructor() {
    this.shaderMap = new Map();
    this.textureMap = new Map();
  }

  async initShaders(): Promise<Result<Unit, string>> {
    const manifest = await Result.fromExceptionAsync(fetch('shaders/shaderManifest.json'));
    if (manifest.isErr()) return Err(manifest.unwrapErr().message);

    const json = await Result.fromExceptionAsync(manifest.unwrap().json());
    if (json.isErr()) return Err(manifest.unwrapErr().message);

    const shaderNames = (json.unwrap() as ShaderManifest).shaders;
    const filePaths = shaderNames.map((name) => [
      `shaders/${name}/${name}.vert`,
      `shaders/${name}/${name}.frag`,
    ]);
    const promises = filePaths.flatMap((paths) => paths.map((path) => fetch(path)));

    const responses = await Result.multipleExceptionsAsync(promises);
    if (responses.isErr()) return Err(responses.unwrapErr().message);
    const fileContents = await Result.multipleExceptionsAsync(
      responses.unwrap().map((r) => r.text())
    );
    if (fileContents.isErr()) return Err(fileContents.unwrapErr().message);

    const shaders = shaderNames.map((name) => new Shader(name));
    fileContents.unwrap().chunks(2, ([vert, frag], idx) => {
      const floored = Math.floor(idx / 2);
      shaders[floored].compileFromSource(vert, frag);
    });
    shaders.forEach((shader) => shader.link());

    shaderNames.forEach((name, idx) => this.shaderMap.set(name, shaders[idx]));
    return Ok(unit);
  }

  async initTextures(): Promise<Result<Unit, string>> {
    const manifest = await Result.fromExceptionAsync(fetch('textures/textureManifest.json'));
    if (manifest.isErr()) return Err(manifest.unwrapErr().message);

    const json = await Result.fromExceptionAsync(manifest.unwrap().json());
    if (json.isErr()) return Err(manifest.unwrapErr().message);

    const textureNames = (json.unwrap() as TextureManifest).textures;
    const texturePromises = textureNames.map((name) =>
      TextureCreator.allocateFromImageUrlAsync({
        url: `textures/${name}`,
        texureOptions: {
          wrapX: 'Repeat',
          wrapY: 'Repeat',
          magFilter: 'Linear',
          minFilter: 'Linear',
          format: 'RGBA',
        },
      })
    );
    const res = await Result.multipleExceptionsAsync(texturePromises);

    if (res.isErr()) return Err(res.unwrapErr().message);
    const textures = res
      .unwrap()
      .filter((t) => t.isOk())
      .map((t) => t.unwrap());

    // Remove the extension name
    textureNames.mapInPlace((name) => {
        let j = -1

        for (let i = name.length; i >= 0; i--) {
          if (name[i] == '.') {
            j = i
            break
          }
        }

        assert(j != -1, `Invalid file name for ${name}, requires a '.' extension`)
        return name.slice(0, j)
    })

    textureNames.forEach((name, i) => this.textureMap.set(name, textures[i]));
    return Ok(unit);
  }

  getShader(shader: string): Shader {
    requires(this.shaderMap.has(shader), `${shader} shader not found in shader map`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.shaderMap.get(shader)!;
  }

  getTexture(texture: string): Texture {
    requires(this.textureMap.has(texture), `${texture} texture not found in texture map`);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.textureMap.get(texture)!;
  }

  toString(): string {
    let string = ''

    string += 'SHADERS:\n'
    for (const shader of this.shaderMap.keys()) {
      string += `\t${shader}\n`
    }

    string += 'TEXTURES:\n'
    for (const texture of this.textureMap.keys()) {
      string += `\t${texture}\n`
    }

    return string
  }
}
