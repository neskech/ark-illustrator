precision highp float;
varying highp vec2 vTextureCoord;

uniform sampler2D canvas;          
                          
void main() {
    //texture2D(canvas, vTextureCoord)
    gl_FragColor = vec4(1, 1, 1, 1);
}