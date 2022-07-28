#![allow(non_snake_case)]
#![allow(dead_code)]
 #![feature(cstr_from_bytes_until_nul)]
 #![feature(core_c_str)]
use Core::application::App;


pub extern crate gl;
mod Canvas;
mod OpenGL;
mod Core;
mod GUI;



fn main() {
    std::env::set_var("RUST_BACKTRACE", "1");
    let mut app = App::new((800, 800));
    app.run();

}