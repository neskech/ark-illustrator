
use nalgebra as na;

use crate::Core::event::*;

//intial values
const FOV: f32 = 1.2f32;
const ZNEAR: f32 = 0.01f32;
const ZFAR: f32 = 10f32;

const MAX_ZOOM_LEVEL: f32 = 20f32;
const MIN_ZOOM_LEVEL: f32 = 0.001f32;

pub struct Camera{
    pub Position: na::Vector3<f32>,

    pub CameraRight: na::Vector3<f32>,
    pub CameraUp: na::Vector3<f32>,

    pub Rotation: f32,

    pub Fov: f32,
    pub ZNear: f32,
    pub ZFar: f32,

    orthoGraphicWidth: f32,
}

impl Camera{
    pub fn New(orthoWidth: f32) -> Self {
        let aspect: f32 = 1f32;
        Self {
            Position: na::Vector3::new(0f32, 0f32, 1f32 + MIN_ZOOM_LEVEL as f32),
            CameraRight: na::Vector3::new(1f32, 0f32, 0f32),
            CameraUp: na::Vector3::new(0f32, 1f32, 0f32),
            Rotation: 0f32,
            Fov:f32::atan2(aspect, 1f32) * 2f32,
            ZNear: MIN_ZOOM_LEVEL,
            ZFar: MAX_ZOOM_LEVEL,
            orthoGraphicWidth: orthoWidth,
        }
    }

    pub fn GetProjectionMatrix(&self) -> na::Matrix4<f32>{
        let aspect: f32 = 1f32;
        let fov = f32::atan2(aspect, 1f32) * 2f32;
        *na::Perspective3::new(unsafe { 800 as f32 / 800 as f32 }, fov, MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL).as_matrix()
    }

    pub fn GetViewMatrix(&self) -> na::Matrix4<f32>{

                                                        
        let eye = na::Point3::new(self.Position.x, self.Position.y, self.Position.z);
        let target = na::Point3::new(self.Position.x, self.Position.y, 0f32);
        
         na::Isometry3::look_at_rh(&eye, &target, &self.CameraUp).to_matrix()

        // let f = (target - eye).normalize();
		// let s = f.cross(&self.CameraUp).normalize();
		// let u = s.cross(&f);

		// let mut Result: na::Matrix4<f32> = na::Matrix4::new(0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32, 0f32);
		// Result[0] = s.x;
		// Result[4] = s.y;
		// Result[8] = s.z;
		// Result[1] = u.x;
		// Result[5] = u.y;
		// Result[9] = u.z;
		// Result[2] =-f.x;
		// Result[6] =-f.y;
		// Result[10] =-f.z;
		// Result[12] = -(s.dot(&eye));
		// Result[13] = -(u.dot(&eye));
		// Result[14] = f.dot(&eye);
		//Result
	

    //     let target = na::Point3::new(self.Position.x, self.Position.y, 0f32);

    //     let rotation = self.rotate(&na::Vector2::new(self.Rotation, 0f32));
    //     (na::Translation3::<f32>::from(target.coords)
    //     * rotation
    //     * na::Translation3::<f32>::from(na::Point3::new(0f32, 0f32, self.Position.z))).inverse()
    // .to_homogeneous()
    }

    pub fn rotate(&self, rel: &na::Vector2<f32>) -> na::UnitQuaternion<f32>{
        let around_x =
            na::UnitQuaternion::from_axis_angle(&na::Vector3::x_axis(), rel.y as f32 * 0.005);
        let around_z =
            na::UnitQuaternion::from_axis_angle(&na::Vector3::z_axis(), -rel.x as f32 * 0.005);

        let rotation = around_z * around_x;
        rotation

      
    }



 

    pub fn OnEvent(&mut self, event: &Event){
        let rotSpeed = 0.1f32;
       // println!("Pos {:?} rotation {} zoom {}", self.Position, self.Rotation, self.Position.z);
         if let Event::KeyPressed(KeyPressedEvent { Key, ..}) = event {
            let speed = 0.3f32;
            match *Key {
                glfw::Key::S => {
                    self.Position += na::Vector3::y() * speed;
                },
                glfw::Key::W => {
                    self.Position -= na::Vector3::y() * speed;
                },
                glfw::Key::D => {
                    self.Position -= na::Vector3::x() * speed;
                },
                glfw::Key::A => {
                    self.Position += na::Vector3::x() * speed;
                }
                glfw::Key::E => {
                    println!("Hello!");
                    self.Rotation += rotSpeed;
                    self.CameraUp = na::Vector3::new(f32::sin(self.Rotation), f32::cos(self.Rotation), 0f32);
                    self.CameraRight = na::Vector3::new(f32::cos(self.Rotation), -f32::sin(self.Rotation), 0f32);
                },
                glfw::Key::R => {
                    self.Rotation -= rotSpeed;
                    self.CameraUp = na::Vector3::new(f32::sin(self.Rotation), f32::cos(self.Rotation), 0f32);
                    self.CameraRight = na::Vector3::new(f32::cos(self.Rotation), -f32::sin(self.Rotation), 0f32);
                },
                glfw::Key::Q => {
                    println!("BEFORE Q {}", self.Position.z);
                    self.Position.z += speed;
                    println!("aFTER Q {}", self.Position.z);
                },
                glfw::Key::Tab => {
                    self.Position.z -= speed;
                },
                _ => {}
            }
            //println!("Position {:?}", self.Position);
        }
 
    }

}