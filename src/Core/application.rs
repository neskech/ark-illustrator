
use glutin::{event_loop::ControlFlow, event::{Event, WindowEvent, VirtualKeyCode, KeyboardInput}, dpi::PhysicalSize, Api};



pub struct App{
    eventLoop: glutin::event_loop::EventLoop<()>,
    windowContext: glutin::ContextWrapper<glutin::PossiblyCurrent, glutin::window::Window>,
    eguiState: egui_winit::State,
    state: super::state::AppState,

}

impl App{
    pub fn new(defaultSize: (i32, i32)) -> Self {
        let el = glutin::event_loop::EventLoop::new();
        let wb = glutin::window::WindowBuilder::new().with_title("A fantastic window!")
        .with_inner_size(PhysicalSize::new(defaultSize.0, defaultSize.1))
        .with_resizable(true)
        .with_visible(true);
    
        let windowContext = glutin::ContextBuilder::new().with_vsync(true)
        .with_gl(glutin::GlRequest::Specific(Api::OpenGl, (4, 1))).build_windowed(wb, &el).unwrap();
    
        let windowContext = unsafe { windowContext.make_current().unwrap() };
        gl::load_with(|s| windowContext.get_proc_address(s) as *const _);

        let eguiState = egui_winit::State::new(gl::MAX_TEXTURE_SIZE as usize,  windowContext.window());

        Self {
            eventLoop: el,
            windowContext: windowContext,
            eguiState: eguiState,
            state: super::state::AppState::new()
        }
    }

   
    pub fn run(self){

        
        let App {eventLoop, windowContext, mut eguiState, mut state} = self;
        let eguiCtx = egui_winit::egui::Context::default();

        eventLoop.run(move |event, _, control_flow| {
            //println!("{:?}", event);
            *control_flow = ControlFlow::Wait;

            match event {
                Event::LoopDestroyed => (),
                Event::WindowEvent { event, .. } => match event {
                    WindowEvent::Resized(physical_size) => windowContext.resize(physical_size),
                    WindowEvent::CloseRequested => *control_flow = ControlFlow::Exit,
                    WindowEvent::KeyboardInput { input: KeyboardInput {virtual_keycode: Some(key), ..}, ..} => {
                        if VirtualKeyCode::Escape == key {
                            *control_flow = ControlFlow::Exit;
                        }
                    },
                    _ => {
                        eguiState.on_event(&eguiCtx, &event);
                    },
            
                },
                Event::RedrawRequested(_) => {
                   
                    unsafe {
                         gl::ClearColor(0.6f32, 0.1f32, 0.75f32, 1f32);
                         gl::Clear(gl::COLOR_BUFFER_BIT);
                    }

                    let raw = eguiState.take_egui_input(windowContext.window());
                    eguiCtx.begin_frame(raw);
            

        
                    state.renderGUI(&eguiCtx);

                    let out = eguiCtx.end_frame();
                    eguiState.handle_platform_output(windowContext.window(), &eguiCtx, out.platform_output);

                    windowContext.swap_buffers().unwrap();

                },
                Event::MainEventsCleared => {
                    windowContext.window().request_redraw();
                },
                _ => (),
            }
        })

    
    }

    pub fn handleEvents(&self){
      
    }



}