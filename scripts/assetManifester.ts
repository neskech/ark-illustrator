import { readdirSync, statSync, writeFileSync } from 'fs';

const SHADER_ROOT = './public/shaders/';
const TEXTURE_ROOT = './public/textures/';

function createShaderManifest() {
  const contents = readdirSync(SHADER_ROOT);
  const directoryNames = contents.filter((name) => {
    const stat = statSync(`${SHADER_ROOT}/${name}`);
    return stat.isDirectory();
  });
  const obj = {shaders: directoryNames}
  const json = JSON.stringify(obj, null, 2);
  writeFileSync(`${SHADER_ROOT}/shaderManifest.json`, json);
}

function createTextureManifest() {
  const contents = readdirSync(TEXTURE_ROOT);
  const fileNames = contents.filter((name) => {
    const stat = statSync(`${TEXTURE_ROOT}/${name}`);
    return stat.isFile() && ['jpg', 'png', 'webp'].some((end) => name.endsWith(end));
  });
  const obj = {textures: fileNames}
  const json = JSON.stringify(obj, null, 2);
  writeFileSync(`${TEXTURE_ROOT}/textureManifest.json`, json);
}

function errorWrapper(f: () => void) {
  try {
    f();
  } catch (e) {
    console.error(e);
  }
}

function main() {
  errorWrapper(() => createShaderManifest());
  errorWrapper(() => createTextureManifest());
}

main();
