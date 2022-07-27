use gl::types::*;
use crate::OpenGL::texture::{Texture, TextureParams};

pub struct FrameBuffer{
    ID: GLuint,
    TextureAttachment: Texture,
    RboID: GLuint,
}

impl FrameBuffer{
    pub fn New(size: (i32, i32)) -> Result<Self, String>{
        let mut id = 0;
        unsafe { gl::GenFramebuffers(1, &mut id) }; 
        let mut s = Self { 
             ID: id, 
             TextureAttachment: Texture::default(),
             RboID: 0 
        };

        if let Err(msg) = s.Create(size){
            return Err(msg);
        }
        Ok(s)
    }

    fn Create(&mut self, size: (i32, i32)) -> Result<(), String>{
        self.Bind();

        self.TextureAttachment = Texture::New()
            .SetTextureParams(TextureParams{
                WrapX: gl::CLAMP_TO_EDGE as i32,
                WrapY: gl::CLAMP_TO_EDGE as i32,
                MinFilter: gl::LINEAR as i32,
                MagFilter: gl::LINEAR as i32,
                MipmapLevels: None,
            })
            .AllocateImage(size, gl::RGB);

        unsafe {
            gl::FramebufferTexture2D(gl::FRAMEBUFFER, gl::COLOR_ATTACHMENT0, gl::TEXTURE_2D, self.TextureAttachment.GetID(), 0);

            //generate the render buffer attachment for the depth and stencil buffers
            gl::GenRenderbuffers(1, &mut self.RboID);
            gl::BindRenderbuffer(gl::RENDERBUFFER, self.RboID);
            gl::RenderbufferStorage(gl::RENDERBUFFER, gl::DEPTH24_STENCIL8, size.0, size.1);
            gl::BindRenderbuffer(gl::RENDERBUFFER, 0);

            //attach the RBO
            gl::FramebufferRenderbuffer(gl::FRAMEBUFFER, gl::DEPTH_STENCIL_ATTACHMENT, gl::RENDERBUFFER, self.RboID);

            if gl::CheckFramebufferStatus(gl::FRAMEBUFFER) != gl::FRAMEBUFFER_COMPLETE {
                return Err(String::from("Error! Could not create framebuffer!\n"));
            }  
        }

        self.UnBind();
        Ok(())
    }

    pub fn ClearColor(color: (f32, f32, f32, f32)){
        unsafe { gl::ClearColor(color.0, color.1, color.2, color.3) };
    }

    pub fn ClearBufferOfType(bufferType: u32){
        unsafe { gl::Clear(bufferType) };
    }

    pub fn EnableDepthTest(&self){
        unsafe { gl::Enable(gl::DEPTH_TEST); };
    }

    pub fn DepthFunction(&self, blendFunc: u32){
        unsafe { gl::DepthFunc(blendFunc) };
    }

    pub fn DisableDepthTest(&self){
        unsafe { gl::Disable(gl::DEPTH_TEST) };
    }

    pub fn EnableBlending(&self){
        unsafe { 
            gl::Enable(gl::BLEND);
            gl::BlendFunc(gl::SRC_ALPHA, gl::ONE_MINUS_SRC_ALPHA);
        }
    }

    pub fn Bind(&self){
        unsafe { gl::BindFramebuffer(gl::FRAMEBUFFER, self.ID) };
    }

    pub fn UnBind(&self){
        unsafe { gl::BindFramebuffer(gl::FRAMEBUFFER, 0) };
    }
}