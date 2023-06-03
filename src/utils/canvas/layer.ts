import { GL } from "../web/glUtils";
import Texture, { TextureOptions } from "../web/texture";

const LAYER_TEXTURE_OPTIONS: TextureOptions = {
    wrapX: 'Clamp To Edge',
    wrapY: 'Clamp To Edge',
    minFilter: 'Nearest',
    magFilter: 'Nearest',
    format: 'RGBA'
}

class Layer {
    imageData: Texture 

    constructor(gl: GL) {
        this.imageData = new Texture(gl, LAYER_TEXTURE_OPTIONS);
    }
}