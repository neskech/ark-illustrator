precision highp float;
varying highp vec3 vColor;
varying highp vec2 vTextureCoord;
varying highp float v_opacity;

uniform sampler2D tex;
uniform float flow;
                     
void main() {
    vec4 color = texture2D(tex, vTextureCoord);
    color.rgb = vColor; //vec3((color.r + color.g + color.b) / 3.0);
    color.a *= flow * v_opacity;
    gl_FragColor = color;
}