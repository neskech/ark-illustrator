precision highp float;
uniform vec2 u_resolution;

float circleShape(vec2 position, float radius) {
    float dist = distance(position, vec2(0.5));
    return step(radius, dist);
}


void main() {
     vec2 normalized = gl_FragCoord.xy / u_resolution;
     float value = circleShape(normalized, 0.2);
     vec3 color = vec3(value, 0, 0.3);
     gl_FragColor = vec4(color, 1);
}