import { Err, Result } from '~/application/general/result';
import Shader from '../webgl/shader';
import Texture from '../webgl/texture';
import { None, Option } from '~/application/general/option';

export default class AssetManager {
  private shaderMap: Map<string, Shader>;
  private textureMap: Map<string, Texture>;

  constructor() {
    this.shaderMap = new Map();
    this.textureMap = new Map();
  }

  async initShaders(): Promise<Result<string, string>> {
    const SHADER_DIRECTORY = 'shaders'
    const folderOfShaders = await fetch(SHADER_DIRECTORY)
    console.log(folderOfShaders)
    return Err('');
  }

//   async initTextures(): Promise<Result<string, string>> {
//     return Err('');
//   }
  
  getShader(shader: string): Option<Shader> {
    return None()
  }

  getTexture(texture: string): Option<Texture> {
    return None()
  }
}
