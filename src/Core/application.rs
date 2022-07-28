
use super::window::{Window, translateEvent};
use egui_glfw_gl as egui_backend;
use queues::IsQueue;



pub static mut SCREEN_WIDTH: u32 = 800;
pub static mut SCREEN_HEIGHT: u32 = 800;

pub struct App{
    window: Window,
    eventBus: queues::Queue<glfw::WindowEvent>,
    state: super::state::AppState,

}

impl App{
    pub fn new(defaultSize: (u32, u32)) -> Self {
 
        Self {
            window: Window::new(defaultSize),
            eventBus: queues::Queue::new(),
            state: super::state::AppState::new()
        }
    }

   
    pub fn run(&mut self){

        
        let mut eguiCtx = egui::CtxRef::default();
        let size = self.window.size;
        let mut painter = egui_backend::Painter::new(&mut self.window.glfwWindow, size.0, size.1);
        
        let mut then = 0f32;
        let mut now: f32;
        let mut delta: f32;

        let (width, height) = self.window.glfwWindow.get_framebuffer_size();
        let native_pixels_per_point = self.window.glfwWindow.get_content_scale().0;
        let mut egui_input_state = egui_backend::EguiInputState::new(egui::RawInput {
            screen_rect: Some(egui::Rect::from_min_size(
                egui::Pos2::new(0f32, 0f32),
                egui::vec2(width as f32, height as f32) / native_pixels_per_point,
            )),
            pixels_per_point: Some(native_pixels_per_point),
            ..Default::default()
        });
 
        let start_time = std::time::Instant::now();

        while !self.window.shouldClose() {
            now = self.window.getTime() as f32;
            delta = now - then;
            then = self.window.getTime() as f32;


   
            // eguiCtx.begin_frame(egui_input_state.input.take());
            // egui_input_state.input.pixels_per_point = Some(native_pixels_per_point);
            // egui_input_state.input.time = Some(start_time.elapsed().as_secs_f64());

            //self.state.renderGUI(&eguiCtx);
            unsafe { gl::Viewport(0, 0, 1600, 1600) };
            self.state.render();

            // let (egui_output, paint_cmds) = eguiCtx.end_frame();
            // //Handle cut, copy text from egui
            // if !egui_output.copied_text.is_empty() {
            //     egui_backend::copy_to_clipboard(&mut egui_input_state, egui_output.copied_text);
            // }

    
            // let paint_jobs = eguiCtx.tessellate(paint_cmds);
            // painter.paint_jobs(
            //     None,
            //     paint_jobs,
            //     &eguiCtx.texture(),
            //     native_pixels_per_point,
            // );

          
            for (_, event) in self.window.getEvents() {
                self.eventBus.add(event).unwrap();
            }

            while self.eventBus.size() > 0 {
                let event = self.eventBus.remove().unwrap();
                match event {
                    glfw::WindowEvent::Close => self.window.glfwWindow.set_should_close(true),
                    _ => { 
                      //  egui_backend::handle_event(event.clone(), &mut egui_input_state); 
                        self.state.onEvent(translateEvent(event));
                    }
                }
            }

            self.window.swapBuffers();
            self.window.glfw.poll_events();
        }
        

    
    }

}
