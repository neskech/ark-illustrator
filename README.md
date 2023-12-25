# Ark Illustrator

## A Drawing Application Made For The Web
### [Demo](https://ark-86i5jjg1w-craig-mellors-projects.vercel.app/)


Built entirely with Typescript and Webgl

---
- ### Features
  - Textured Brushes via image url
  - Pen pressure for variable size and opacity
  - Pannable, Zoomable, and Rotatable Canvas
  - Configurable Brush Stabilization

---
## Controls

---

- For mouse users
  - 
    - Middle mouse click and draw :: Pan 
    - Scroll Wheel :: Zoom
    - Alt + mouse drag :: Rotate
    - c :: Clear Canvas
    - s :: Settings Menu
    - i :: EyeDropper
- For touchpad users
  -
    - Finger Pinch :: Zoom
    - Finger Pan :: Pan
    - Finger Rotate :: Rotate
    - Two Finger Triple Tap :: Clear Canvas
    - Four Finger Double Tap :: Settings Menu
    - One Finger Long Hold :: Eyedropper

---
- ### Tech Stack
    - WebGL
    - NextJS
    - Typescript
    - TailwindCSS

---
### Future Plans / Improvements
   
 - 1
   -  
      Brushes are currently implemented as a sequence of image 'stamps'.
      These stamps are packed densely next to one another which gives the
      illusion of a continuous stroke. This method is not ideal for performance
      nor for visual quality. As such, I will explore 'skeletal' and parametrically defined
      strokes in the future
      
 - 2
   -  
      Once the brush system is finished, the next step is to build a UI
      from which the user can select the different tools. Ontop of this
      UI will be non-trivial tools such as the paint bucket and lasso
      tool

---
### Remarks

I hope for this application to be a fully fledged drawing editor on par with the likes
of other online editors such as [aggie.io](https://aggie.io/). However, this will take
an enourmous amount of time and effort. Resources on creating brush engines are few 
and far between on the internet. If you have any experience with creating these types
of applications please feel free to reach out to me! I could use the help :)
