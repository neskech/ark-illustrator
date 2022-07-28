use glfw::{Key, Action, Modifiers, MouseButton};


pub struct KeyListener{
    pub KeyCodes: [u8; 350],
}


impl KeyListener{
    pub fn New() -> Self{
        Self { KeyCodes: [0; 350] }
    }

    pub fn onKeyPressed(&mut self, event: &glfw::WindowEvent){
        if let glfw::WindowEvent::Key(keyCode, _, action, mods) = event {
            let keyRef: &mut u8 = &mut self.KeyCodes[*keyCode as usize]; //to avoid writing the array indexing each time

            //first bit is the state (pressed or released)
            //second bit is for key repeat
            match action {
                Action::Release => { *keyRef = 0; return; }, //0 = 0b00000000
                Action::Press =>  *keyRef = 1, //1 = 0b10000000
                Action::Repeat => *keyRef |= 3, //3 = 0b11 -> Second bit for repeat
            }
            
            //add the modifier bits (6 bits)
            //Make the first two bits 0
            *keyRef |= mods.bits() as u8 >> 2;
       }
        
    }

    pub fn IsKeyPressed(&self, keyCode: Key, mods: Option<&[Modifiers]>) -> bool{
        let keyRef: &u8 = &self.KeyCodes[keyCode as usize]; //to avoid writing the array indexing each time
        let mut sat: bool = *keyRef & 1 == 1;

        if let Some(modifiers) = mods {
            for modifier in modifiers {
                //check last 6 bits against the modifier
                //The sat &&... is for if the *keyRef & 1 == 1 was false
                sat = sat && *keyRef << 2 == modifier.bits() as u8;
                if !sat {
                    return false;
                }
            }
        }

        sat
    }

    pub fn IsKeyRepeated(self, keyCode: Key, mods: Option<&[Modifiers]>) -> bool{
        let keyRef: &u8 = &self.KeyCodes[keyCode as usize]; //to avoid writing the array indexing each time
        let mut sat: bool = *keyRef & 3 == 3; //first two bits must be 1

        if let Some(modifiers) = mods {
            for modifier in modifiers {
                //check last 6 bits against the modifier
                //The sat &&... is for if the *keyRef & 1 == 1 was false
                sat = sat && *keyRef << 2 == modifier.bits() as u8;
                if !sat {
                    return false;
                }
            }
        }

        sat
    }

    pub fn onEvent(&mut self, event: &glfw::WindowEvent){
        self.onKeyPressed(event);
    }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TODO utilize tuple structs for (X, Y), (Dx, Dy), (ScrollX, ScrollY), (DScrollX, DScrollY)
pub struct MouseListener{
    pub MousePos: (f32, f32),
    pub MousePosChange: (f32, f32),

    pub Scroll: (f32, f32),
    pub ScrollChange: (f32, f32),

    pub MouseCodes: [u8; 8],
}

impl MouseListener{
    pub fn New() -> Self{
        Self { 
            MousePos: (0f32, 0f32),
            MousePosChange: (0f32, 0f32),
            Scroll: (0f32, 0f32),
            ScrollChange: (0f32, 0f32),
            MouseCodes: [0; 8] 
        }
    }

    pub fn onMousePressed(&mut self, event: &glfw::WindowEvent){
        if let glfw::WindowEvent::MouseButton(mouseButton, action, mods) = event{
            let mouseRef: &mut u8 = &mut self.MouseCodes[*mouseButton as usize]; //to avoid writing the array indexing each time

            //first bit is the state (pressed or released)
            //second bit is for key repeat
            match action {
                Action::Release => { *mouseRef = 0; return; }, //0 = 0b00000000
                Action::Press =>  *mouseRef = 1, //1 = 0b10000000
                Action::Repeat => *mouseRef |= 3, //3 = 0b11 -> Second bit for repeat
            }
            
            //add the modifier bits (6 bits)
            //Make the first two bits 0
            *mouseRef |= mods.bits() as u8 >> 2;
        }
        
    }

    pub fn onMouseScroll(&mut self, event: &glfw::WindowEvent){
        if let glfw::WindowEvent::Scroll(x, y) = event {
            self.ScrollChange = (*x as f32 - self.Scroll.0, *y as f32 - self.Scroll.1);
            self.Scroll = (*x as f32, *y as f32);
        }
    }

    pub fn onMouseCursor(&mut self, event: &glfw::WindowEvent){
        if let glfw::WindowEvent::CursorPos(x, y) = event {
            self.MousePosChange = (*x as f32 - self.MousePos.0, *y as f32 - self.MousePos.1);
            self.MousePos = (*x as f32, *y as f32);
        }
    }

    pub fn IsMouseButtonPressed(&self, mouseButton: MouseButton, mods: Option<&[Modifiers]>) -> bool{
        let mouseRef: &u8 = &self.MouseCodes[mouseButton as usize]; //to avoid writing the array indexing each time
        let mut sat: bool = *mouseRef & 1 == 1;

        if let Some(modifiers) = mods {
            for modifier in modifiers {
                //check last 6 bits against the modifier
                //The sat &&... is for if the *keyRef & 1 == 1 was false
                sat = sat && *mouseRef << 2 == modifier.bits() as u8;
                if !sat {
                    return false;
                }
            }
        }

        sat
    }

    pub fn IsMouseButtonRepeated(&self, mouseButton: MouseButton, mods: Option<&[Modifiers]>) -> bool{
        let mouseRef: &u8 = &self.MouseCodes[mouseButton as usize]; //to avoid writing the array indexing each time
        let mut sat: bool = *mouseRef & 3 == 3; //first two bits must be 1

        if let Some(modifiers) = mods {
            for modifier in modifiers {
                //check last 6 bits against the modifier
                //The sat &&... is for if the *keyRef & 1 == 1 was false
                sat = sat && *mouseRef << 2 == modifier.bits() as u8;
                if !sat {
                    return false;
                }
            }
        }

        sat
    }

    pub fn onEvent(&mut self, event: &glfw::WindowEvent){
        self.onMouseCursor(event);
        self.onMousePressed(event);
        self.onMouseScroll(event);
    }

    
}