precision highp float;
varying highp vec3 vColor;
varying highp vec2 vTextureCoord;
varying highp float vOpacity;

uniform sampler2D tex;
uniform float flow;
                                            
void main() {
    float hardness = 0.0;
    // a. The DISTANCE from the pixel to the center
    float d = distance(vTextureCoord,vec2(0.5)) / sqrt(2.0);
    float dd = 1.0 - min(1.0, d);
    dd *= dd * dd;

    vec4 color = texture2D(tex, vTextureCoord);
    float opac = (color.r + color.g + color.b) / 3.0; 
    color.rgb = vColor;
    color.a = opac * flow;
   // color.a = min(vOpacity, opac * flow);
    gl_FragColor = color;
} 