#![allow(non_snake_case)]
#![allow(dead_code)]
use Core::application::App;


pub extern crate gl;
mod Canvas;
mod OpenGL;
mod Core;
mod GUI;



fn main() {
    let app = App::new((800, 800));
    app.run();

}