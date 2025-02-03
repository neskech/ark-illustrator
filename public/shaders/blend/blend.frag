#version 300 es
precision highp float;

in highp vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D canvas;    
uniform sampler2D overlay;  
uniform float opacity;
uniform int blendMode;  

#define NORMAL 0
#define OVERWRITE 1
#define MULTIPLY 2

vec4 normal(vec4 canv, vec4 over) {
    float alpha = over.w * opacity;
    vec4 res = alpha * over + (1.0 - alpha) * canv;
    res.w = canv.w + over.w;
    return res;
}

vec4 overwrite(vec4 canv, vec4 over) {
    return over;
}

vec4 multiply(vec4 canv, vec4 over) {
    vec4 dst = canv * over;
    return normal(canv, dst);
}

vec4 blend() {
    vec4 canvasColor = texelFetch(canvas, ivec2(gl_FragCoord.xy), 0);
    vec4 overlayColor = texelFetch(overlay, ivec2(gl_FragCoord.xy), 0);
    switch (blendMode) {
        case NORMAL:
            return normal(canvasColor, overlayColor);
        case OVERWRITE:
            return overwrite(canvasColor, overlayColor);
        case MULTIPLY:
            return multiply(canvasColor, overlayColor);
    }

    return vec4(0.9451, 0.4275, 0.4275, 1.0);
}

void main() {
    vec4 color = blend();
    fragColor = color;
}