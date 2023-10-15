precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float circleShape(vec2 position, float radius) {
    float dist = distance(position, vec2(0.5));
    return step(radius, dist);
}

        /* Blending function */
        /* Smoothmin functions by Inigo Quilez */
        float sBlendExpo(float a, float b, float k) {
            float res = exp(-k * a) + exp(-k * b);
            return -log(res) / k;
        }
        float sBlendPoly(float a, float b, float k) {
            float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
            return mix(b, a, h) - k * h * (1.0 - h);
        }
        float sBlendPower(float a, float b, float k) {
            a = pow(a, k); b = pow(b, k);
            return pow((a * b) / (a + b), 1.0 / k);
        }


void main() {
     vec2 normalized = gl_FragCoord.xy / u_resolution;
     vec2 norm_mouse = (u_mouse / u_resolution);

     float radius = 0.2;
     float dist = distance(normalized, norm_mouse);
     float value = step(radius, dist);

     float alpha = 1.0;
     if (value == 0.0)
        alpha = 1.;

     vec3 color = vec3(value, 1,  1);
     gl_FragColor = vec4(color, alpha);
}