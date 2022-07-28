#type vertex
#version 410 core

layout (location=0) in vec2 pos;

uniform mat4 proj;
uniform mat4 view;


void main(){
  
    gl_Position =  vec4(pos.x, pos.y, 0.0, 1.0);
}

#type fragment
#version 410 core


out vec4 Color;

void main(){
     Color = vec4(0, 1, 0, 0.2);
      //Color = texture(canvas, texf);
}
