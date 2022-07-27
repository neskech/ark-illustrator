
use std::ffi::c_void;

use gl::types::*;
use image::*;
use image::io::Reader as ImageReader;

pub struct TextureParams{
    pub WrapX: GLint,
    pub WrapY: GLint,
    pub MinFilter: GLint,
    pub MagFilter: GLint,
    pub MipmapLevels: Option<i32>
}

//TODO add a texture builder struct

#[derive(Default)]
pub struct Texture{
    ID: GLuint,
}

impl Texture{
    pub fn New() -> Self {
        let mut id = 0;
        unsafe { gl::GenTextures(1, &mut id); }
        Self { ID: id }
    }

    //builder pattern
    pub fn SetTextureParams(self, params: TextureParams) -> Self {
        unsafe {
            self.Bind(); 
            gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_S, params.WrapX);
            gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_WRAP_T, params.WrapY);
            gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MIN_FILTER, params.MinFilter);
            gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAG_FILTER, params.MagFilter);

            if let Some(mipMapLevels) = params.MipmapLevels {
                gl::GenerateMipmap(gl::TEXTURE_2D);
                gl::TexParameteri(gl::TEXTURE_2D, gl::TEXTURE_MAX_LEVEL, mipMapLevels);
            }
            self.UnBind();
        }
        self
    }

    //builder pattern -- meant to be called last
    pub fn SetTextureImage(self, path: &str) -> Result<Self, String> {
        let img = ImageReader::open(path);
        if let Err(_) = img {
            return Err(format!("Error! Could not read image from path of: {}", path));
        }

        let decoded = img.unwrap().decode();
        if let Err(_) = decoded {
            return Err(format!("Error! Could not decode image from path of: {}", path));
        }
        let finalImage = decoded.unwrap();
        let channels = if finalImage.color().has_alpha(){
                                 gl::RGBA 
                            } else { 
                                 gl::RGB 
                            };

        unsafe {
            self.Bind();
            gl::TexImage2D(
                gl::TEXTURE_2D,
                0,
                channels as i32,
                finalImage.width() as i32,
                finalImage.height() as i32,
                0,
                channels,
                gl::UNSIGNED_BYTE,
                finalImage.as_bytes() as *const _ as *const c_void
            );
            self.UnBind();
        }

        Ok(self)
    }

    pub fn AllocateImage(self, size: (i32, i32), format: GLenum) -> Self{
        self.Bind();

        unsafe { 
                gl::TexImage2D(
                gl::TEXTURE_2D, 
                0, 
                format as i32, 
                size.0, 
                size.1, 
                0,
                format, 
                gl::UNSIGNED_BYTE,
                std::ptr::null()
            ); 
        }

        self.UnBind();
        self
    }


    pub fn Bind(&self){
        unsafe { gl::BindTexture(gl::TEXTURE_2D, self.ID) };
    }

    pub fn UnBind(&self){
        unsafe { gl::BindTexture(gl::TEXTURE_2D, 0) };
    }

    pub fn GetID(&self) -> GLuint{
        self.ID
    }

    pub fn Destroy(&self){
        unsafe { gl::DeleteTextures(1, &self.ID) };
    }
}

impl Drop for Texture{
    fn drop(&mut self) {
        self.Destroy();
    }
}