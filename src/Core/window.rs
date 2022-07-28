use core::ffi::CStr;
use std::{sync::mpsc::Receiver, ffi::{c_void, CString}};
use glfw::{Key, Action, Context, SwapInterval};
use super::event::*;



pub struct Window{
    pub glfwWindow: glfw::Window,
    pub glfw: glfw::Glfw,
    pub size: (u32, u32),
    events: Receiver<(f64, glfw::WindowEvent)>

}

impl Window{
    pub fn new(size: (u32, u32)) -> Self{
        let mut glfw = glfw::init(glfw::FAIL_ON_ERRORS).unwrap();
        glfw.window_hint(glfw::WindowHint::ContextVersion(4, 1));
        glfw.window_hint(glfw::WindowHint::OpenGlProfile(glfw::OpenGlProfileHint::Core));
        glfw.window_hint(glfw::WindowHint::OpenGlForwardCompat(true));
        glfw.window_hint(glfw::WindowHint::DoubleBuffer(true));
        glfw.window_hint(glfw::WindowHint::Resizable(false));
        glfw.window_hint(glfw::WindowHint::OpenGlDebugContext(true));

        let (mut window, events) = glfw.create_window(size.0, size.1, "Hello this is window", glfw::WindowMode::Windowed)
            .expect("Failed to create GLFW window.");

        Self::setPollingTypes(&mut window);

        window.make_current();
        glfw.set_swap_interval(SwapInterval::Sync(1)); //vsync
        gl::load_with(|s| window.get_proc_address(s) as *const _);

        // unsafe { 
        //     gl::Enable(gl::DEBUG_OUTPUT); 
        //     gl::DebugMessageCallback(Some(callback), std::ptr::null()); 
        // }
        
        return Self{
            glfwWindow: window,
            glfw: glfw,
            events: events,
            size: size,
        }
    }

    fn setPollingTypes(window: &mut glfw::Window){
        window.set_key_polling(true);
        window.set_mouse_button_polling(true);
        window.set_cursor_pos_polling(true);
        window.set_close_polling(true);
        window.set_framebuffer_size_polling(true);
        window.set_size_polling(true);
        window.set_maximize_polling(true);
    }

    pub fn getEvents(&self) -> glfw::FlushedMessages<'_, (f64, glfw::WindowEvent)>{
        glfw::flush_messages(&self.events)
    }

       
    pub fn swapBuffers(&mut self){
        self.glfwWindow.swap_buffers();
    }

    pub fn getTime(&self) -> f64{
        self.glfw.get_time()
    }

    pub fn resize(&mut self, newSize: (u32, u32)){
        self.size = newSize;
        self.glfwWindow.set_size(self.size.0 as i32, self.size.1 as i32);
    }

    pub fn shouldClose(&self) -> bool{
        self.glfwWindow.should_close()
    }

}

//TODO move this to the event file
pub fn translateEvent(event: glfw::WindowEvent) -> Event {
    match event {
        glfw::WindowEvent::Key(Key::Escape, _, Action::Press, _ ) => {
            Event::WindowClose(WindowCloseEvent{})
        },
        glfw::WindowEvent::Key(key, _, action, mods) => {
            Event::KeyPressed(KeyPressedEvent{Key: key, Action: action, Mods: mods})
        },
        glfw::WindowEvent::MouseButton(mouseButton, _,  mods) => {
            Event::MousePressed(MouseButtonPressedEvent{MouseButton: mouseButton, Mods: mods})
        },
        glfw::WindowEvent::CursorPos(x, y) => {
            Event::MouseMoved(MouseMovedEvent{X: x, Y: y})
        },
        glfw::WindowEvent::Size(width, height) => {
            Event::WindowResize(WindowResizeEvent{Width: width, Height: height})
        },
        glfw::WindowEvent::Scroll(x, y) => {
            Event::MouseScrolled(MouseScrollEvent{ScrollX: x, ScrollY: y})
        },
        glfw::WindowEvent::Maximize(_) => {
            Event::WindowMaximize(WindowMaximizeEvent{})
        }
        _ => {panic!("Cannot handle event type")}
    }
}

//type MyFn = extern "system" fn(u32, u32, u32, u32, i32, *const i8, *mut c_void);

extern "system" fn callback(source: u32, errType: u32, id: u32, severity: u32, length: i32, message: *const i8, userParam: *mut c_void){
  
    println!("Error! type = {}, Severity = {}, message = {}", errType, severity, unsafe { CStr::from_ptr(message).to_str().unwrap() });
}