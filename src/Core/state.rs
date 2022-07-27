use crate::{Canvas::{layer::Layer, tool::Tool, camera::Camera}, GUI::gui::Gui};

const NUM_TOOLS: usize = 0;

struct Renderer{

}

// pub struct AppData{ //TODO put this inside of canvas, which will also have the canvas size in pixels
//     layers: Vec<Layer>,
//     currentLayer: usize,
//     tools: [Box<dyn Tool>; NUM_TOOLS],
//     currentTool: usize,
//     camera: Camera,
// }

pub struct AppData{ //TODO put this inside of canvas, which will also have the canvas size in pixels

}
pub struct AppState{
    gui: Gui,
    data: AppData,

}

impl AppState {
    pub fn new() -> Self {
        Self {  
           gui: Gui::new(),
           data: AppData {  }
        }
    }

    pub fn renderGUI(&mut self, eguiCtx: &egui::CtxRef){
        self.gui.render(&mut self.data, eguiCtx);
    }

    pub fn onEvent(&self) {

    }
}