attribute vec2 aPosition;
attribute vec3 aColor;
attribute vec2 aTextureCoord;
attribute float aOpacity;

varying highp vec3 vColor;
varying highp vec2 vTextureCoord;
varying highp float vOpacity;

void main() {
    gl_Position = vec4(aPosition, 0, 1);
    vTextureCoord = aTextureCoord;     
    vOpacity = aOpacity;       
    vColor = aColor; 
}