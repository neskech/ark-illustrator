
pub enum ToolType{
    Brush,
    Rotate,
    Pan,
    Zoom,
    FillBucket,
}
pub trait Tool{
    fn onLeftClick(&self);
    fn onRightClick(&self);
}