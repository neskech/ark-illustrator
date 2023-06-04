attribute vec3 a_position;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
 
void main() {
   gl_Position = model * view * projection * vec4(a_position, 1);
}