
use std::{fs::{File}, io::{self, BufRead}, path::Path, ffi::{CStr, CString}, os::raw::c_char};
use gl::types::*;
use nalgebra as na;

pub struct Shader{
    id : GLuint
}

impl Shader{
    pub fn New(path: &str) -> Shader{

        let mut s = Shader{
            id : 0
        };

        if let Err(msg) = s.Construct(path) {
            eprint!("{}", msg);
        }
        
        return s;
    }

    fn Construct(&mut self, path: &str) -> Result<(), String>{
        let shaders = ReadGLSL(path);

        unsafe {
            let vShader: GLuint = gl::CreateShader(gl::VERTEX_SHADER);
            let st = CString::new(shaders.0.clone()).unwrap();
  

            gl::ShaderSource(vShader, 1, 
                &(st.as_ptr() as *const c_char), 
                std::ptr::null());
   
            gl::CompileShader(vShader);
           
            if let Err(msg) = Shader::HandleShaderCompilation(vShader, "Vertex") {
                println!("{}", shaders.0);
                gl::DeleteShader(vShader);
                return Err(format!("{}\nError! Vertex shader of {} failed to compile", msg, path));
            }

            let fShader: GLuint = gl::CreateShader(gl::FRAGMENT_SHADER);
            let st = CString::new(shaders.1.clone()).unwrap();
            gl::ShaderSource(fShader, 1, 
                &(st.as_ptr() as *const c_char), 
                std::ptr::null());
            gl::CompileShader(fShader);

            if let Err(msg) = Shader::HandleShaderCompilation(fShader, "Fragment") {
                println!("{}", shaders.1);
                gl::DeleteShader(vShader);
                gl::DeleteShader(fShader);
                return Err(format!("{}\nError orginated from: \n{}", msg, path));
            }

            //link the programs
            self.id = gl::CreateProgram();
            gl::AttachShader(self.id, vShader);
            gl::AttachShader(self.id, fShader);
            gl::LinkProgram(self.id);
            //must detach shaders for them to be deleted
            gl::DetachShader(self.id, vShader);
            gl::DetachShader(self.id, fShader);
            print!("AHAHHAHAHA");

            //check for errors
            if let Err(msg) = self.HandleProgramLinkage() {
                gl::DeleteShader(vShader);
                gl::DeleteShader(fShader);
                gl::DeleteProgram(self.id);
                return Err(format!("{}\nError originated from: \n{}", msg, path));
            }

            //cleanup
            gl::DeleteShader(vShader);
            gl::DeleteShader(fShader);
        }

        Ok(())
    
    }

    unsafe fn HandleShaderCompilation(shader: GLuint, shaderType: &str) -> Result<(), String> {
        let mut compileStatus: i32 = 1;
        gl::GetShaderiv(shader, gl::COMPILE_STATUS, &mut compileStatus as *mut i32);

        //check compilation status of vertex shader
        if compileStatus == 0 {
            let mut length: GLint = 0; 
            gl::GetShaderiv(shader, gl::INFO_LOG_LENGTH, &mut length as *mut i32);

            let error = create_whitespace_cstring_with_len(length as usize);
            gl::GetShaderInfoLog(shader, length, std::ptr::null_mut(), error.as_ptr() as *mut GLchar);

            
            
            return Err(
                format!("Error! {} Shader failed to compile! The issue: {:?}", shaderType, error.to_string_lossy().to_owned())
            );

        }

        Ok(())
    }

    unsafe fn HandleProgramLinkage(&self) -> Result<(), String>{
        let mut success: GLint = 0;
        gl::GetProgramiv(self.id, gl::LINK_STATUS, &mut success as *mut i32);

        if success == 0 {
            let mut length = 0;
            gl::GetProgramiv(self.id, gl::INFO_LOG_LENGTH, &mut length);

            let error = create_whitespace_cstring_with_len(length as usize);
            gl::GetProgramInfoLog(self.id, 
                length, 
                std::ptr::null_mut(),  
                error.as_ptr() as *mut gl::types::GLchar
            );

            return Err(
                format!("Error! Shader linkage failed! The issue: {:?}", error.to_string_lossy().to_owned())
            );
        }

        Ok(())
    }

   ///////////////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////
   ///                             UPLOADS                                   /////
   /// ///////////////////////////////////////////////////////////////////////////
   /// ///////////////////////////////////////////////////////////////////////////
    
   pub fn UploadInt(&self, val: i32, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform1i(loc, val); 
        }
   }
   
   pub fn UploadFloat(&self, val: f32, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform1f(loc, val); 
        }
   }

   pub fn UploadBool(&self, val: bool, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            //bools in glsl are 4 bytes
            gl::Uniform1i(loc, val as i32); 
        }
   }

   pub fn UploadVec2(&self, val: na::Vector2<f32>, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform2f(loc, val.x, val.y); 
        }
   }

   pub fn UploadVec3(&self, val: na::Vector3<f32>, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform3f(loc, val.x, val.y, val.z); 
        }
   }

   pub fn UploadVec4(&self, val: na::Vector4<f32>, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform4f(loc, val.x, val.y, val.z, val.w); 
        }
   }

   pub fn UploadMatrix2x2(&self, val: na::Matrix2<f32>, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::UniformMatrix2fv(loc, 1, 0, val.as_slice().as_ptr() as *const f32); 
        }
   }

   pub fn UploadMatrix3x3(&self, val: na::Matrix3<f32>, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::UniformMatrix3fv(loc, 1, 0, val.as_slice().as_ptr() as *const f32); 
        }
   }  

   pub fn UploadMatrix4x4(&self, val: na::Matrix4<f32>, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::UniformMatrix4fv(loc, 1, 0, val.as_slice().as_ptr() as *const f32); 
        }
   }

    pub fn SetTextureSlot(&self, slot: i32, location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform1i(loc, slot); 
        }
    }

    pub fn SetTextureSlots(&self, slots: &[i32], location: CString){
        unsafe { 
            let loc = gl::GetUniformLocation(self.id, location.as_ptr());
            gl::Uniform1iv(loc, slots.len() as i32, slots.as_ptr());
        }
    }

   
   /// ///////////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////////////
   ///                             FIN                                       /////
   /// ///////////////////////////////////////////////////////////////////////////
   /// ///////////////////////////////////////////////////////////////////////////


    pub fn Activate(&self){
        unsafe { gl::UseProgram(self.id) };
    }

    pub fn DeActivate(&self){
        unsafe { gl::UseProgram(0) };
    }

    pub fn GetID(&self) -> u32{
        self.id
    }

    pub fn Destroy(&self){
        unsafe { gl::DeleteProgram(self.id) }
    }
}



impl Drop for Shader{
    fn drop(&mut self) {
        self.Destroy();
    }
}

fn ReadGLSL(path: &str) -> (String, String){
    let fileLines = read_lines(path)
         .expect(&format!("Unable to read shader file of {} in shader.rs!", path)[..]);

    let mut vertex = String::from("");
    let mut fragment = String::from(""); //TODO make an array and use shaderID to index into it

    let mut shaderID = 0;
    for line in fileLines {
        let content = line.unwrap();

        if content.contains("#type vertex"){
            shaderID = 0;
            continue;
        }
        else if content.contains("#type fragment"){
            shaderID = 1;
            continue;
        }
        
        if shaderID == 0 {
            vertex = format!("{}\n{}", vertex, content);
        }
        else {
            fragment = format!("{}\n{}", fragment, content);
        }
    }

    (vertex, fragment)
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<std::io::BufReader<File>>>
where P: AsRef<Path>, {
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

fn create_whitespace_cstring_with_len(len: usize) -> CString {
    // allocate buffer of correct size
    let mut buffer: Vec<u8> = Vec::with_capacity(len + 1);
    // fill it with len spaces
    buffer.extend([b' '].iter().cycle().take(len));
    // convert buffer to CString
    unsafe { CString::from_vec_unchecked(buffer) }
}