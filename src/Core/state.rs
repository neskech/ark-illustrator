use crate::{Canvas::{layer::Layer, tool::Tool, camera::Camera, renderer::Renderer}, GUI::gui::Gui};

use super::event::{Event, MouseButtonPressedEvent, MouseMovedEvent};

const NUM_TOOLS: usize = 0;


// pub struct AppData{ //TODO put this inside of canvas, which will also have the canvas size in pixels
//     layers: Vec<Layer>,
//     currentLayer: usize,
//     tools: [Box<dyn Tool>; NUM_TOOLS],
//     currentTool: usize,
//     camera: Camera,
// }

pub struct AppData{ //TODO put this inside of canvas, which will also have the canvas size in pixels
    renderer:  Renderer,
    camera: Camera,
}   
pub struct AppState{
    gui: Gui,
    data: AppData,

}

impl AppState {
    pub fn new() -> Self {
        Self {  
           gui: Gui::new(),
           data: AppData { renderer: Renderer::new(), camera: Camera::New(0f32) }
        }
    }

    pub fn renderGUI(&mut self, eguiCtx: &egui::CtxRef){
        self.gui.render(&mut self.data, eguiCtx);
    }

    pub fn render(&mut self){
        self.data.renderer.render(&self.data.camera);
    }

    pub fn onEvent(&mut self, event: Event) {
        self.data.camera.OnEvent(&event);
        if let Event::MouseMoved(MouseMovedEvent { X, Y }) = event {
            self.data.renderer.addQuad((X as f32, Y as f32), 1f32, None);
        }
    }
}