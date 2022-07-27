use std::cell::RefCell;

use super::window::Window;
use egui_glfw_gl as egui_backend;



pub static mut SCREEN_WIDTH: u32 = 800;
pub static mut SCREEN_HEIGHT: u32 = 800;

pub struct App{
    window: RefCell<Window>,
    state: super::state::AppState,

}

impl App{
    pub fn new(defaultSize: (u32, u32)) -> Self {
 
        Self {
            window: RefCell::new(Window::new(defaultSize)),
            state: super::state::AppState::new()
        }
    }

   
    pub fn run(&mut self){

        
        let mut eguiCtx = egui::CtxRef::default();
        let size = self.window.borrow().size;
        let mut painter = egui_backend::Painter::new(&mut self.window.borrow_mut().glfwWindow, size.0, size.1);
        
        let mut then = 0f32;
        let mut now: f32;
        let mut delta: f32;

        let (width, height) = self.window.borrow().glfwWindow.get_framebuffer_size();
        let native_pixels_per_point = self.window.borrow().glfwWindow.get_content_scale().0;
        let mut egui_input_state = egui_backend::EguiInputState::new(egui::RawInput {
            screen_rect: Some(egui::Rect::from_min_size(
                egui::Pos2::new(0f32, 0f32),
                egui::vec2(width as f32, height as f32) / native_pixels_per_point,
            )),
            pixels_per_point: Some(native_pixels_per_point),
            ..Default::default()
        });
 
        let start_time = std::time::Instant::now();

        while !self.window.borrow().shouldClose() {
            now = self.window.borrow().getTime() as f32;
            delta = now - then;
            then = self.window.borrow().getTime() as f32;


            unsafe {
                gl::ClearColor(0.6f32, 0.1f32, 0.75f32, 1f32);
                gl::Clear(gl::COLOR_BUFFER_BIT);
            }

   
            eguiCtx.begin_frame(egui_input_state.input.take());
            egui_input_state.input.pixels_per_point = Some(native_pixels_per_point);
            egui_input_state.input.time = Some(start_time.elapsed().as_secs_f64());

            self.state.renderGUI(&eguiCtx);

            let (egui_output, paint_cmds) = eguiCtx.end_frame();
            //Handle cut, copy text from egui
            if !egui_output.copied_text.is_empty() {
                egui_backend::copy_to_clipboard(&mut egui_input_state, egui_output.copied_text);
            }


            let paint_jobs = eguiCtx.tessellate(paint_cmds);
            painter.paint_jobs(
                None,
                paint_jobs,
                &eguiCtx.texture(),
                native_pixels_per_point,
            );

            self.window.borrow_mut().glfw.poll_events();
            for (_, event) in self.window.borrow().getEvents() {
                match event {
                    glfw::WindowEvent::Close => self.window.borrow_mut().glfwWindow.set_should_close(true),
                    _ => { egui_backend::handle_event(event, &mut egui_input_state); }
                }
            }

            self.window.borrow_mut().swapBuffers();
            self.window.borrow_mut().glfw.poll_events();
        }

        

    
             


    
    }





}
