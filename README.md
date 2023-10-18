# Ark Illustrator

## A Drawing Application Made For The Web
[Demo](https://ark-86ohwib9i-craig-mellors-projects.vercel.app/ )

---
### Features
-
  - Textured Brushes via image url
  - Pen pressure for variable size and opacity
  - Pannable, Zoomable, and Rotatable Canvas

---
## Controls

---

- For mouse users
  - 
    - Middle mouse click and draw :: Pan 
    - Scroll Wheel :: Zoom
    - Alt + mouse drag :: Rotate
- For touchpad users
  -
    - Finger Pinch :: Zoom
    - Finger Pan :: Pan
    - Finger Rotate :: Rotate
    - Two Double Finger Tap (Tap with two fingers, and do that twice) :: Clear Canvas 

---
### Tech Stack
-
    - WebGL
    - NextJS
    - Typescript
    - TailwindCSS

---
### Future Plans / Improvements

 - 1
   -
      You may notice a stroke 'flickers' after you finish drawing it. This is because 
      finished strokes are rendered on a different layer. Right now the application can't
      blend that layer properly with the canvas, resulting in a shift of color
   
 - 2
   -  
      Brushes are currently implemented as a sequence of image 'stamps'.
      These stamps are packed densely next to one another, which gives the
      illusion of a continuous stroke. This method is not ideal for performance,
      nor for visual quality. I will explore 'skeletal' and parametrically defined
      strokes in the future
      
 - 3
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
