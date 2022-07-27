// use crate::OpenGL::{buffer::{VertexBuffer, IndexBuffer}, shader::Shader, texture::Texture, frameBuffer::FrameBuffer};

// use super::{camera::Camera, layer::Layer};


// const MAX_TEXTURES_PER_DRAW_CALL: usize = 32;
// const MAX_QUADS_PER_DRAW_CALL: usize = 20_000;

// #[derive(Clone, Copy)]
// struct Vertex{
//     position: f32,
//     vertexID: u32,
// }
// pub struct Renderer{
//     vertexBuffer: VertexBuffer, //TODO make the struct type paramaterized
//     indexBuffer: IndexBuffer,
//     shader: Shader,
//     canvas: FrameBuffer,

//     numQuadsInBuffer: usize,
//     bufferOverflow: Vec<Vertex>, //For any overflowing vertiices incase the user drew to fast
//     quadSizes: Vec<usize> //Just in case the user draw more than MAX_QUADS and switched to a new brush of a different size, we'll have to sets of quads to draw
// }

// impl Renderer{
//     pub fn new() -> Self {
//         //create the indices
//         let mut indices: Vec<u16> = Vec::with_capacity(MAX_QUADS_PER_DRAW_CALL * 6);
//         for i in 0..MAX_QUADS_PER_DRAW_CALL {
//             let c = i as u16;
//             indices.push(0 + c * 4);
//             indices.push(1 + c * 4);
//             indices.push(3 + c * 4);
//             indices.push(0 + c * 4);
//             indices.push(3 + c * 4);
//             indices.push(2 + c * 4);
//         }

//         //TODO add errors to creating buffers (if the created buffer was null or not)
//         Self {
    
//         }
//     }

//     fn init(&mut self){

//     } 

//     pub fn render(&self, camera: &Camera){
//         //TODO set the canvas framebuffer as current and render any quads to it ONLY if there are quads in the VBO
//         self.renderCanvas();
//         //TODO render the canvas texture to a quad and switch back to main framebuffer. Send the camera to the shader and render everything
//         //TODO Do not reset the canvas texture with a clear color. It shouldn't have a depth attachment either

//     }

//     fn renderCanvas(&self){
//         //TODO draw everything from the vertex buffer hee
//         //TODO The shader will be sent a vector direction and size uniform for the quads and construct the quads itself
//     }

//     pub fn addQuad(&mut self, pos: (f32, f32), size: f32, texture: &Texture){
      
//     }

//     pub fn layerSwap(&mut self, from: usize, to: usize, layers: &Vec<Layer>){ //TODO Make a layer swap event

//     }
// }
