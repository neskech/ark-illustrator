
use std::ffi::c_void;
use super::MatchType;
use gl::types::*;

struct VAO{
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

    pub fn AddAtribute<T: 'static>(&mut self, stride: u32, vertexSizeBytes: i32, divisor: Option<u32>){
        unsafe { 
                gl::VertexAttribPointer(
                    self.NumAttributes, 
                    std::mem::size_of::<T>() as i32, 
                    MatchType::<T>(), 
                    gl::FALSE,
                    vertexSizeBytes, 
                    &self.ByteLength as *const _ as *const c_void
                ); 

                gl::EnableVertexAttribArray(self.NumAttributes);
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

    pub fn Destroy(&self){
        unsafe { gl::DeleteVertexArrays(1, &self.ID) };
    }

}


impl Drop for VAO{
    fn drop(&mut self) {
        self.Destroy();
    }
}

