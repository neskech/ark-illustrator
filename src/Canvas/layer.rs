use crate::OpenGL::texture::Texture;

enum BlendingMode{
    Multiply(f32),
    Overlay(f32),
    Colordodge(f32),
}

pub struct Layer{
    data: Texture,
    mode: BlendingMode,
    name: String,
    lockedTransparency: bool,
    clipped: (bool, usize), //usize for the index of the layer its clipped to
}

impl Layer{
    pub fn new() -> Self {
        Self {
            data: todo!(), //TODO add logic for empty texture
            mode: todo!(),
            name: todo!(),
            lockedTransparency: todo!(),
            clipped: todo!(),
        }
    }
}