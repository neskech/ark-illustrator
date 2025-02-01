attribute vec2 a_position;
varying highp vec2 vTextureCoord;

const vec2 scale = vec2(0.5, 0.5);

void main() {
    gl_Position = vec4(a_position, 0, 1);
    vTextureCoord = a_position * scale + scale;  
}