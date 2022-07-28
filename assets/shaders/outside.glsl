#type vertex
#version 410 core

layout (location=0) in vec2 pos;
layout (location=1) in vec2 tex;

uniform mat4 proj;
uniform mat4 view;

out vec2 texf;

void main(){
    texf = tex;
    gl_Position = proj * view * vec4(pos.x, pos.y, 0.0, 1.0);
}

#type fragment
#version 410 core

in vec2 texf;
uniform sampler2D canvas;

out vec4 Color;

void main(){
     //Color = vec4(0, 0, 0, 1);
      Color = texture(canvas, texf);
}
