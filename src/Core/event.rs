


#[derive(Clone)]
pub enum Event{
    MouseMoved(MouseMovedEvent),
    MousePressed(MouseButtonPressedEvent),
    MouseReleased(MouseButtonReleasedEvent),
    MouseScrolled(MouseScrollEvent),
    KeyPressed(KeyPressedEvent),
    KeyReleased(KeyReleasedEvent),
    WindowResize(WindowResizeEvent),
    WindowMaximize(WindowMaximizeEvent),
    WindowClose(WindowCloseEvent),
}

#[derive(Clone)]
pub struct MouseMovedEvent{
    pub X: f64,
    pub Y: f64,
}

#[derive(Clone)]
pub struct MouseButtonPressedEvent{
    pub MouseButton: glfw::MouseButton,
    pub Mods: glfw::Modifiers,
}

#[derive(Clone)]
pub struct MouseButtonReleasedEvent{
    pub MouseButton: glfw::MouseButton,
    pub Mods: glfw::Modifiers,
}

#[derive(Clone)]
pub struct MouseScrollEvent{
    pub ScrollX: f64,
    pub ScrollY: f64
}

#[derive(Clone)]
pub struct KeyPressedEvent{
    pub Key: glfw::Key,
    pub Action: glfw::Action,
    pub Mods: glfw::Modifiers,
}

#[derive(Clone)]
pub struct KeyReleasedEvent{
    pub Key: glfw::Key,
}

#[derive(Clone)]
pub struct WindowResizeEvent{
    pub Width: i32,
    pub Height: i32,
}

#[derive(Clone)]
pub struct WindowCloseEvent{

}
#[derive(Clone)]
pub struct WindowMaximizeEvent{
    
}

#[macro_export]
macro_rules! Dispatch { 
    ($variant:pat, $dispatcher:expr, $function:expr, $self:expr) => {
        if let $variant = $dispatcher.Event {
            $dispatcher.Dispatch($function, $self);
        }
    }; 
}

pub struct EventDispatcher<'a>{
    pub Event: &'a Event,
    pub Handled: bool,
}

impl<'a> EventDispatcher<'a>{
    pub fn New(event: &'a Event) -> Self{
        Self { Event: event, Handled: false }
    }
    
    //E is the event type we want to dispatch
    pub fn Dispatch<T, F>(&mut self, func: F, s: &T)
    where F: Fn(&T, &Event) -> bool
    {
       if self.Handled { return; }
       self.Handled = func(s, &self.Event);
    }
}

