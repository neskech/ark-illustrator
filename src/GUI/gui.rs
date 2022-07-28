
use egui::Context;

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
    //TODO have this take in the event bus
    pub fn render(&mut self, data: &mut AppData, eguiCtx: &egui::CtxRef){
        
        for panel in &mut self.panels {
            let close = (panel.renderFunction)(data, eguiCtx);
            panel.enabled = close;
        }
    }
}