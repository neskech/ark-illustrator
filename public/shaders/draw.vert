precision highp float;
void main() {
     float radius = dot(gl_FragCoord.xy, gl_FragCoord.xy);
     float mult = floor(radius / 0.50);
     gl_FragColor = vec4(0, 0, 1, mult);
}