precision highp float;

varying highp vec2 vTextureCoord;

uniform sampler2D canvas; 

void main() {
    gl_FragColor = texture2D(canvas, vTextureCoord);
}