precision highp float;
varying highp vec3 vColor;
varying highp vec2 vTextureCoord;
varying highp float vOpacity;

uniform float flow;
                                            
void main() {
    vec4 color;
    color.rgb = vColor;
    color.a = min(vOpacity, flow);
    gl_FragColor = color;
} 