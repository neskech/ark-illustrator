
use std::ffi::c_void;
use super::MatchType;
use gl::types::*;

pub struct VAO{
    ID: GLuint,
    NumAttributes: u32,
    ByteLength: u32,
}

impl VAO{
    pub fn New() -> Self{
        let mut s = Self { ID: 0, NumAttributes: 0, ByteLength: 0 };
        unsafe { gl::GenVertexArrays(1, &mut s.ID) };
        s
    }

    pub fn AddAtribute<T: 'static>(&mut self, stride: u32, vertexSizeBytes: i32, offset: usize, divisor: Option<u32>){
        unsafe { 
                gl::EnableVertexAttribArray(self.NumAttributes);

                println!("HERE IT IS {} {}", self.ByteLength, self.NumAttributes);
                gl::VertexAttribPointer(
                    self.NumAttributes, 
                    stride as i32, 
                    MatchType::<T>(), 
                    gl::FALSE,
                    vertexSizeBytes, 
                (std::mem::size_of::<T>() * offset) as *const gl::types::GLvoid
                ); 

           
                if let Some(div) = divisor {
                    gl::VertexAttribDivisor(self.NumAttributes, div);
                }
        }

        self.NumAttributes += 1;
        self.ByteLength += stride * std::mem::size_of::<T>() as u32;
    }

    pub fn ResetByteCount(&mut self){
        self.ByteLength = 0;
    }

    pub fn Bind(&self){
        unsafe { gl::BindVertexArray(self.ID) }
    }

    pub fn UnBind(&self){
        unsafe { gl::BindVertexArray(0) }
    }

    pub fn Destroy(&self){
        unsafe { gl::DeleteVertexArrays(1, &self.ID) };
    }

}


impl Drop for VAO{
    fn drop(&mut self) {
        self.Destroy();
    }
}

