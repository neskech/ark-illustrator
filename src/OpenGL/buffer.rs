
use std::{ffi::c_void, ptr::null};
use std::ffi::CString;
use gl::types::*;
use super::shader::Shader;

//TODO create a 'buffer' trait that provides 'bufferData' and 'bufferSubData' methods

pub struct VertexBuffer{
    id: GLuint,
}

impl VertexBuffer{
    pub fn New() -> Self{
        let mut me = Self {id: 0};
        unsafe { gl::GenBuffers(1, &mut me.id as *mut GLuint) };
        me
    }

    pub fn BufferData<T>(data: &Vec<T>, usage: u32){
        unsafe { 

            gl::BufferData(
                gl::ARRAY_BUFFER, 
                (std::mem::size_of::<T>() * data.len()) as isize, 
                data as *const Vec<T> as *const c_void,
                usage
            );
        };
    }

    pub fn BufferSubData<T>(data: &Vec<T>, offset: usize, length: usize){
        unsafe { 
 
            gl::BufferSubData(
                gl::ARRAY_BUFFER, 
                (offset * std::mem::size_of::<T>()) as isize, 
                (std::mem::size_of::<T>() * length) as isize, 
                data as *const Vec<T> as *const c_void,
            );

        };
    }

    pub fn AllocateData<T>(length: usize, usage: u32){
        unsafe { 

            gl::BufferData(
                gl::ARRAY_BUFFER, 
                (std::mem::size_of::<T>() * length) as isize, 
                null(), 
                usage
            );

        };
    }

    pub fn Bind(&self){
        unsafe { gl::BindBuffer(gl::ARRAY_BUFFER, self.id); };
    }

    pub fn UnBind(&self){
        unsafe { gl::BindBuffer(gl::ARRAY_BUFFER, 0); };
    }

    pub fn IsValid(&self) -> bool{
        self.id != 0
    }

    pub fn Destroy(&mut self){
        unsafe { gl::DeleteBuffers(1, &self.id as *const GLuint) };
    }
}

impl Drop for VertexBuffer{
    fn drop(&mut self){
        self.Destroy();
    }
}


////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
/////////////////////// INDEX BUFFER ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////


pub struct IndexBuffer{
    id: GLuint,
}

impl IndexBuffer{
    pub fn New() -> Self{
        let mut me = Self {id: 0};
        unsafe { gl::GenBuffers(1, &mut me.id as *mut GLuint) };
        me
    }

    pub fn BufferData(data: &Vec<u32>, usage: u32){
        unsafe { 

            gl::BufferData(
                gl::ELEMENT_ARRAY_BUFFER, 
                (std::mem::size_of::<u32>() * data.len()) as isize, 
                data as *const Vec<u32> as *const c_void,
                usage
            );
        };
    }

    pub fn BufferSubData(data: &Vec<u32>, offset: usize, length: usize){
        unsafe { 
 
            gl::BufferSubData(
                gl::ELEMENT_ARRAY_BUFFER, 
                (offset * std::mem::size_of::<u32>()) as isize, 
                (std::mem::size_of::<u32>() * length) as isize, 
                data as *const Vec<u32> as *const c_void,
            );

        };
    }

    pub fn AllocateData(length: usize, usage: u32){
        unsafe { 

            gl::BufferData(
                gl::ELEMENT_ARRAY_BUFFER, 
                (std::mem::size_of::<u32>() * length) as isize, 
                null(), 
                usage
            );

        };
    }

    pub fn Bind(&self){
        unsafe { gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, self.id); };
    }

    pub fn UnBind(&self){
        unsafe { gl::BindBuffer(gl::ELEMENT_ARRAY_BUFFER, 0); };
    }

    pub fn IsValid(&self) -> bool{
        self.id != 0
    }

    pub fn Destroy(&mut self){
        unsafe { gl::DeleteBuffers(1, &self.id as *const GLuint) };
    }
}

impl Drop for IndexBuffer{
    fn drop(&mut self){
        self.Destroy();
    }
}

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
/////////////////////// INDEX BUFFER ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

struct UniformBuffer{
    ID: GLuint,
    BindingPoint: u32,
    Name: CString,
}

impl UniformBuffer{
    pub fn New(bindingPoint: u32, name: &str) -> Self {
        let mut id : u32 = 0;
        unsafe { gl::GenBuffers(1, &mut id)  };
        Self { 
            ID: id ,
            BindingPoint: bindingPoint,
            Name: CString::new(name).unwrap(),
        }
    }

    pub fn BufferSubData<T>(data: &Vec<T>, offset: usize, length: usize){
        unsafe { 
 
            gl::BufferSubData(
                gl::UNIFORM_BUFFER, 
                (offset * std::mem::size_of::<T>()) as isize, 
                (std::mem::size_of::<T>() * length) as isize, 
                data as *const Vec<T> as *const c_void,
            );

        };
    }

    pub fn BindShader(&self, shader: &Shader){
        unsafe {
            let idx: u32 = gl::GetUniformBlockIndex(shader.GetID(), self.Name.as_ptr());
            gl::UniformBlockBinding(shader.GetID(), idx, self.BindingPoint);
        }
    }

    //Must be called after binding all appropiate shaders
    pub fn Build(&self, byteSize: isize){
        unsafe {
            
            gl::BufferData(
                gl::UNIFORM_BUFFER,
                byteSize,
                std::ptr::null(),
                gl::STATIC_DRAW
            );
            gl::BindBufferRange(gl::UNIFORM_BUFFER, self.BindingPoint, self.ID, 0, byteSize);
        };
    }

    pub fn Bind(&self){
        unsafe { gl::BindBuffer(gl::UNIFORM_BUFFER, self.ID); };
    }

    pub fn UnBind(&self){
        unsafe { gl::BindBuffer(gl::UNIFORM_BUFFER, 0); };
    }

    pub fn IsValid(&self) -> bool{
        self.ID != 0
    }

    pub fn Destroy(&mut self){
        unsafe { gl::DeleteBuffers(1, &self.ID) }
    }
}

impl Drop for UniformBuffer{
    fn drop(&mut self) {
        self.Destroy();
    }
}