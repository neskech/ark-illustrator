precision highp float;
varying highp vec3 vColor;
varying highp vec2 vTextureCoord;
varying highp float vOpacity;

uniform sampler2D tex;
uniform float flow;
                                            
void main() {
    vec4 color = texture2D(tex, vTextureCoord);
    float opac = (color.r + color.g + color.b) / 3.0; 
    color.rgb = vColor;
    color.a = opac * flow;
    //color.a *= flow * vOpacity;
    gl_FragColor = color;
} 