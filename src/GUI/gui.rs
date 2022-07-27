use egui_winit::{self, egui::Context};
use crate::Core::state::AppData;
use super::panel::{Panel, createToolPanel};


const NUM_PANELS: usize = 1;
pub struct Gui{
    panels: [Panel; NUM_PANELS]
}

impl Gui{
    pub fn new() -> Self {
        Self {
            panels: [createToolPanel()]
        }
    }
    
    pub fn render(&mut self, data: &mut AppData, eguiCtx: &Context){
        
        for panel in &mut self.panels {
            let close = (panel.renderFunction)(data, eguiCtx);
            panel.enabled = close;
        }
    }
}