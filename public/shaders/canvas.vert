attribute vec2 a_position;
attribute vec3 aColor;
attribute vec2 aTextureCoord;
attribute float a_opacity;

varying highp vec3 vColor;
varying highp vec2 vTextureCoord;
varying highp float v_opacity;

void main() {
    gl_Position = vec4(a_position, 0, 1);
    vTextureCoord = aTextureCoord;     
    v_opacity = a_opacity;    
    vColor = aColor;     
}