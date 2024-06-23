import { requires } from '~/util/general/contracts';
import { Err, Ok, Result, unit, type Unit } from '~/util/general/result';
import Shader from '../../../util/webglWrapper/shader';
import Texture from '../../../util/webglWrapper/texture';

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
    const manifest = await Result.fromErrorAsync(fetch('shaders/shaderManifest.json'));
    if (manifest.isErr()) return Err(manifest.unwrapErr().message);

    const json = await Result.fromErrorAsync(manifest.unwrap().json());
    if (json.isErr()) return Err(manifest.unwrapErr().message);

    const shaderNames = (json.unwrap() as ShaderManifest).shaders;
    const filePaths = shaderNames.map((name) => [
      `shaders/${name}/${name}.vert`,
      `shaders/${name}/${name}.frag`,
    ]);
    const promises = filePaths.flatMap((paths) => paths.map((path) => fetch(path)));

    const responses = await Result.multipleErrorAsync(promises);
    if (responses.isErr()) return Err(responses.unwrapErr().message);
    const fileContents = await Result.multipleErrorAsync(responses.unwrap().map((r) => r.text()));
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
    const manifest = await Result.fromErrorAsync(fetch('textures/textureManifest.json'));
    if (manifest.isErr()) return Err(manifest.unwrapErr().message);

    const json = await Result.fromErrorAsync(manifest.unwrap().json());
    if (json.isErr()) return Err(manifest.unwrapErr().message);

    const textureNames = (json.unwrap() as TextureManifest).textures;
    const textures = textureNames.map(
      (_) =>
        new Texture({
          wrapX: 'Repeat',
          wrapY: 'Repeat',
          magFilter: 'Linear',
          minFilter: 'Linear',
          format: 'RGBA',
        })
    );
    const res = await Result.multipleErrorAsync(
      textureNames.map((name, i) => textures[i].allocateFromImageUrlAsync(`textures/${name}`))
    );

    if (res.isErr()) return Err(res.unwrapErr().message);

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
}
