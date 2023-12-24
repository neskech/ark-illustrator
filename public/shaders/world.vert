attribute vec2 a_position;
attribute vec2 aTextureCoord;

uniform mat4 view;
uniform mat4 projection;

varying highp vec2 vTextureCoord;

void main() {
    gl_Position = projection * view * vec4(a_position, 0, 1);
    vTextureCoord = aTextureCoord;     
}