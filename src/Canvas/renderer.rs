
use std::ffi::CString;

use crate::OpenGL::{buffer::{VertexBuffer, IndexBuffer}, shader::Shader, texture::Texture, frameBuffer::FrameBuffer, vao::VAO};

use super::{camera::Camera, layer::Layer};

use nalgebra as na;
static mut firsTime: bool = false;


const MAX_TEXTURES_PER_DRAW_CALL: usize = 32;
const MAX_QUADS_PER_DRAW_CALL: usize = 20_000;

#[derive(Clone, Copy)]
struct Vertex{
    position: f32,
    vertexID: u32,
}

struct Canvas{
    frameBuffer: FrameBuffer,
    indexBuffer: IndexBuffer,
    vertexBuffer: VertexBuffer,
    vao: VAO,
    shader: Shader,

    viewMatrix: nalgebra::Matrix4<f32>,
    orthroProjMatrix: nalgebra::Matrix4<f32>,
}

pub struct Renderer{
    vertexBuffer: VertexBuffer, //TODO make the struct type paramaterized
    vao: VAO,
    canvasShader: Shader,

    canvas: Canvas,

    numQuadsInBuffer: usize,
    bufferOverflow: Vec<Vertex>, //For any overflowing vertiices incase the user drew to fast
    quadSizes: Vec<usize> //Just in case the user draw more than MAX_QUADS and switched to a new brush of a different size, we'll have to sets of quads to draw
}

impl Renderer{
    pub fn new() -> Self {
        const CANVAS_SIZE: (f32, f32) = (100f32, 50f32);
        let aspect = CANVAS_SIZE.0 / CANVAS_SIZE.1;

        let eye = na::Point3::new(0f32, 0f32, 3f32);
        let target = na::Point3::new(0f32, 0f32, 0f32);


        let view =  na::Isometry3::look_at_rh(&eye, &target, &na::Vector3::y_axis()).to_matrix();
        let proj = *na::Orthographic3::new(-aspect, aspect, -1f32, 1f32, 0.001f32, 20f32).as_matrix();

        //TODO add errors to creating buffers (if the created buffer was null or not)
        let mut s = Self {
            vertexBuffer: VertexBuffer::New(),
            vao: VAO::New(),
            canvasShader: Shader::New("./assets/shaders/outside.glsl"),

            canvas: Canvas{
                frameBuffer: FrameBuffer::New((300, 300)).unwrap(),
                vertexBuffer: VertexBuffer::New(),
                indexBuffer: IndexBuffer::New(),
                vao: VAO::New(),
                shader: Shader::New("./assets/shaders/canvas.glsl"),
                viewMatrix: view,
                orthroProjMatrix: proj,
            },
            numQuadsInBuffer: 0,
            bufferOverflow: Vec::new(),
            quadSizes: Vec::new(),
        };
        s.init();
        s
    }

    fn init(&mut self){
        println!("root"); glCheckError();
        
         
          println!("{}", self.canvas.indexBuffer.IsValid());
          //create the indices
          let mut indices: Vec<u32> = Vec::with_capacity(MAX_QUADS_PER_DRAW_CALL * 6);
          for i in 0..MAX_QUADS_PER_DRAW_CALL {
              let c = i as u32;
              indices.push(0 + c * 4);
              indices.push(1 + c * 4);
              indices.push(3 + c * 4);
              indices.push(0 + c * 4);
              indices.push(3 + c * 4);
              indices.push(2 + c * 4);
          }

          println!("before vao"); glCheckError();

        
        //   println!("First first vao"); glCheckError();
        //   self.canvas.vao.AddAtribute::<f32>(1, 3 * 4 as i32, 1, None);
          println!("First vao"); glCheckError();
         



          self.canvas.vao.Bind();
          self.canvas.vertexBuffer.Bind();

 
          println!("index buff"); glCheckError();
          let scale = 1.0f32;
          let verts = [    
                 -0.5f32 * scale,  -0.5f32 * scale, 
                0.5f32 * scale, -0.5f32 * scale, 
                -0.5f32 * scale, 0.5f32 * scale, 
               -0.5f32 * scale,  0.5f32 * scale, 
          ];
          println!("before alloc"); glCheckError();
          self.canvas.vertexBuffer.AllocateData::<f32>(4 * MAX_QUADS_PER_DRAW_CALL, gl::DYNAMIC_DRAW);
          println!("after alloc"); glCheckError();
          self.canvas.vertexBuffer.BufferSubData(&verts.to_vec(), 0, verts.len());
          println!("after buff"); glCheckError();
    
          self.canvas.indexBuffer.Bind();
          self.canvas.indexBuffer.BufferData(&indices, gl::STATIC_DRAW);
   
          self.canvas.vao.AddAtribute::<f32>(2, 2 * 4 as i32, 0, None);
          self.numQuadsInBuffer = 1;
          self.canvas.vertexBuffer.UnBind();
          self.canvas.vao.UnBind();
          self.canvas.indexBuffer.UnBind();

let scale = 0.2f32;
          let vertices = [
            // positions   // texCoords
            -0.5f32 * scale,  0.5f32 * scale,  0f32, 1f32,
            -0.5f32 * scale, -0.5f32 * scale,  0f32, 0f32,
            0.5f32 * scale, -0.5f32 * scale,  1f32, 0f32,

            -0.5f32 * scale,  0.5f32 * scale,  0f32, 1f32,
            0.5f32 * scale, -0.51f32 * scale,  1f32, 0f32,
            0.5f32 * scale,  0.5f32 * scale,  1f32, 1f32,
         ];

         self.vao.Bind();
         self.vertexBuffer.Bind();
         self.vao.AddAtribute::<f32>(2, 4 * std::mem::size_of::<f32>() as i32, 0, None); //pos
         self.vao.AddAtribute::<f32>(2, 4 * std::mem::size_of::<f32>() as i32, 2, None); //uvs
         println!("Second vao"); glCheckError();
    
         self.vertexBuffer.BufferData(&vertices.to_vec(), gl::STATIC_DRAW);
         println!("VBO"); glCheckError();
         self.vertexBuffer.UnBind();
         self.vao.UnBind();

    } 

    pub fn render(&mut self, camera: &Camera){
        //TODO set the canvas framebuffer as current and render any quads to it ONLY if there are quads in the VBO
        self.canvas.frameBuffer.Bind();
        self.renderCanvas();
        self.canvas.frameBuffer.UnBind();

        //println!("After framebuffer"); glCheckError();

        self.canvasShader.Activate();

        unsafe {
            gl::Viewport(0, 0, 1600, 1600);
            gl::ClearColor(0.32f32, 0.25f32, 0.4f32, 1.0f32);
            gl::Clear(gl::COLOR_BUFFER_BIT);
        }
    

        //uploaed the matrices  //! GET THE CAMERA MATRICES
        self.canvasShader.UploadMatrix4x4(camera.GetViewMatrix(), CString::new("view").unwrap());
        self.canvasShader.UploadMatrix4x4(camera.GetProjectionMatrix(), CString::new("proj").unwrap());

   glCheckError();
    
        self.vao.Bind();

        unsafe {
           //gl::Disable(gl::DEPTH_TEST);
            //gl::BindTexture(gl::TEXTURE_2D, self.canvas.frameBuffer.TextureAttachment.GetID());
            self.canvas.frameBuffer.TextureAttachment.Bind();
            gl::DrawArrays(gl::TRIANGLES, 0, 6);  
            glCheckError();
            //println!("After Draw call"); glCheckError();
            self.canvas.frameBuffer.TextureAttachment.UnBind();
           // gl::BindTexture(gl::TEXTURE_2D, 0);
        }
    
        self.vao.UnBind();
        self.canvasShader.DeActivate();
        glCheckError();

        //TODO render the canvas texture to a quad and switch back to main framebuffer. Send the camera to the shader and render everything
        //TODO Do not reset the canvas texture with a clear color. It shouldn't have a depth attachment either

    }

    fn renderCanvas(&mut self){
        //TODO draw everything from the vertex buffer hee
        //TODO The shader will be sent a vector direction and size uniform for the quads and construct the quads itself
        self.canvas.shader.Activate();
        self.canvas.shader.UploadMatrix4x4(self.canvas.viewMatrix, CString::new("view").unwrap());
        self.canvas.shader.UploadMatrix4x4(self.canvas.orthroProjMatrix, CString::new("proj").unwrap());

        // unsafe {
        //     gl::DrawElements(gl::TRIANGLES, 0, gl::UNSIGNED_INT, std::ptr::null());
        // }
        // self.canvas.shader.DeActivate();
        unsafe {
            if unsafe { !firsTime } {
                gl::ClearColor(1f32, 1f32, 1f32, 1f32);
                gl::Clear(gl::COLOR_BUFFER_BIT);
                firsTime = true;
                println!("Here!!!");
            }
            gl::Viewport(0, 0, 600, 600);
            // gl::Enable(gl::BLEND);  
            // gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);  
            // gl::Enable(gl::DEPTH_TEST);
            // gl::DepthFunc(gl::LEQUAL);
            self.canvas.vao.Bind();
            //gl::DrawArrays(gl::TRIANGLES, 0, 3); 
            //println!("Num quads {}", self.numQuadsInBuffer);
            gl::DrawElements(gl::TRIANGLES,  6 * self.numQuadsInBuffer as i32, gl::UNSIGNED_INT, std::ptr::null());
            self.canvas.vao.UnBind();
            self.numQuadsInBuffer = 0;

            self.canvas.shader.DeActivate();
        }
    }

    pub fn addQuad(&mut self, pos: (f32, f32), size: f32, texture: Option<&Texture>){
        let scale = 0.2f32;
        let data = vec![
            -0.5f32 * scale + pos.0,  -0.5f32 * scale + pos.1, 
            0.5f32 * scale + pos.0, -0.5f32 * scale + pos.1, 
            -0.5f32 * scale + pos.0, 0.5f32 * scale + pos.1, 
           -0.5f32 * scale + pos.0,  0.5f32 * scale + pos.1, 
        ];
    //    println!("Num quads {}", self.numQuadsInBuffer);
    //   println!("Before"); glCheckError();
    //   self.canvas.vertexBuffer.Bind();
    //      self.canvas.vertexBuffer.BufferSubData::<f32>(&data, self.numQuadsInBuffer, data.len());
    //      self.vertexBuffer.UnBind();
    //      println!("After"); glCheckError();
    //      self.numQuadsInBuffer += 1;
         
    }

    pub fn layerSwap(&mut self, from: usize, to: usize, layers: &Vec<Layer>){ //TODO Make a layer swap event

    }
}

fn glCheckError()
{
    let mut errorcode = unsafe { gl::GetError() };
    while errorcode != gl::NO_ERROR 
    {
        let error: &str;
        let code = errorcode as gl::types::GLenum;
        match code
        {   
            gl::INVALID_ENUM =>  error = "INVALID_ENUM",
            gl::INVALID_VALUE =>       error = "INVALID_VALUE",   
            gl::INVALID_OPERATION =>        error = "INVALID_OPERATION",       
            gl::STACK_OVERFLOW =>             error = "STACK_OVERFLOW",
            gl::STACK_UNDERFLOW  =>                error = "STACK_UNDERFLOW",
                                                  
            gl::OUT_OF_MEMORY =>                error = "OUT_OF_MEMORY", 
            gl::INVALID_FRAMEBUFFER_OPERATION =>  error = "INVALID_FRAMEBUFFER_OPERATION",
            _ => panic!("Error type not covered")
        }
        println!("GL ERROR:: {}", error);
        errorcode = unsafe { gl::GetError() };
    }
   
}