precision highp float;

varying highp vec2 vTextureCoord;

uniform sampler2D overlay;   
uniform float opacity;
uniform int useMultiply;
uniform sampler2D canvas;

void main() {
    vec4 src_color =  texture2D(overlay, vTextureCoord);
    vec4 dst_color =  texture2D(canvas, vTextureCoord);
    float alpha = min(src_color.a,opacity);

    vec4 color;
    if (useMultiply == 1) {
        vec3 tmp = src_color.rgb * dst_color.rgb;
        //tmp = (src_color.rgb * alpha) * (dst_color.rgb * (1.0 - alpha));
        tmp = tmp * alpha + dst_color.rgb * (1.0 - alpha);
        color =  vec4(tmp.r, tmp.g, tmp.b, 1);
    } else {
        vec3 tmp =  src_color.rgb * alpha + dst_color.rgb * (1.0 - alpha);
        color = vec4(tmp.r, tmp.g, tmp.b, 1);
    }

    gl_FragColor = color;
}