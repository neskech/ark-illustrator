pub mod shader;
pub mod texture;
pub mod buffer;
pub mod vao;
pub mod frameBuffer;

use std::any::TypeId;
use gl::types::GLenum;

fn MatchType<T: 'static>() -> GLenum{
    let id = TypeId::of::<T>();

    if id == TypeId::of::<f32>() {
        return gl::FLOAT;
    }
    else if id == TypeId::of::<i32>() {
        return gl::INT;
    }
    else if id == TypeId::of::<u32>() {
        return gl::UNSIGNED_INT;
    }
    else if id == TypeId::of::<u8>() {
        return gl::UNSIGNED_BYTE;
    }
    else{
        panic!("Error! Type parameter passed into VAO function has no acceptable match!\n");
    }
}