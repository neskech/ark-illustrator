precision highp float;

varying highp vec2 vTextureCoord;

uniform sampler2D canvas;    
uniform sampler2D overlay;  
uniform float opacity;
uniform int blendMode;  

#define NORMAL 0
#define OVERWRITE 1
#define MULTIPLY 2

vec4 normal(vec4 canv, vec4 over) {
    float alpha = canv.w;
    return alpha * canv + (1.0 - alpha) * over;
}

vec4 overwrite(vec4 canv, vec4 over) {
    return over;
}

vec4 multiply(vec4 canv, vec4 over) {
    return canv * over;
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

    return vec4(0, 0, 0, 0);
}

void main() {
    gl_FragColor = blend();
}