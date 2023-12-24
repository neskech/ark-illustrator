/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { clamp } from 'curve-interpolator';
import React, { useEffect, useRef, useState } from 'react';

const DEGREE_OFFSET = 90;

export interface ColorPickerProps {
  size: number;
}

interface Position {
  x: number;
  y: number;
}

interface PickerProps {
  x: number;
  y: number;
}

function Picker({ x, y }: PickerProps) {
  return (
    <div
      className="pointer-events-none absolute z-40 h-3 w-3 rounded-full border-2 border-black bg-white"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    ></div>
  );
}

function ColorPicker(props: ColorPickerProps) {
  const innerSquareSize = Math.floor(props.size * 0.56)

  const [isOuterHeld, setOuterHeld] = useState(false);
  const [degree, setDegree] = useState(0);

  const [isInnerHeld, setInnerHeld] = useState(false);
  const [innerPos, setInnerPos] = useState<Position>({ x: 0, y: 0 });

  const outerCircle = useRef<HTMLDivElement>(null);
  const innerSquare = useRef<HTMLDivElement>(null);

  const [color, setColor] = useState(getColorFromParams(degree, innerPos, innerSquareSize))

  /* TODO: Picker fucks us up. Forward the picker ref */

  useEffect(() => {
    removeEvents();

    mouseUp = () => {
      setOuterHeld(false);
      setInnerHeld(false);
    };
    document.addEventListener('mouseup', mouseUp);

    mouseMove = (e: MouseEvent) => {
      if (isOuterHeld && !isInnerHeld) {
        setDegree(calculateDegree(e, outerCircle.current!));
      } else if (isInnerHeld && !isOuterHeld) {
        setInnerPos(absoluteToRelative(e, innerSquare.current!));
      }
    };
    document.addEventListener('mousemove', mouseMove);

    return removeEvents;
  }, [isOuterHeld, isInnerHeld]);

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-full border-2"
      id="circle"
      ref={outerCircle}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.id != 'circle' || isInnerHeld) return;
        setDegree(calculateDegree(e, outerCircle.current!));
        setOuterHeld(true);
      }}
      style={{
        background: 'conic-gradient(#fc0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        width: `${props.size}px`,
        height: `${props.size}px`,
      }}
    >
      <Picker {...positionByDegree(degree, props.size * 0.445)} />
      <Picker {...innerPos} />

      <div
        className='absolute border-2 border-white'
        style={{
          width: `${Math.floor(props.size * 0.25)}px`,
          height: `${Math.floor(props.size * 0.25)}px`,
          backgroundColor: getColorFromParams(degree, innerPos, innerSquareSize),
          transform: 'translate(-163%, -235%)'
        }}
      >
      </div>

      <div
        className="flex flex-col items-center justify-center rounded-full border-2 bg-slate-800"
        style={{
          width: `${Math.floor(props.size * 0.8)}px`,
          height: `${Math.floor(props.size * 0.8)}px`,
        }}
      >
        <div
          className="border-2"
          id="square"
          ref={innerSquare}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            if (target.id != 'square' || isOuterHeld) return;
            setInnerPos(absoluteToRelative(e, innerSquare.current!));
            setInnerHeld(true);
          }}
          style={{
            width: `${innerSquareSize}px`,
            height: `${innerSquareSize}px`,
            background: `linear-gradient(to bottom right, ${hslToHex(
              getDegree(degree),
              0,
              0
            )}, ${hslToHex(getDegree(degree), 100, 50)})`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default ColorPicker;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! HELPERS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function getDegree(degree: number): number {
  return (degree + DEGREE_OFFSET) % 361;
}

function getColorFromParams(degree: number, boxPos: Position, innerSquareSize: number): string {
  const saturation = Math.floor(50 * (boxPos.x / innerSquareSize + 0.5)) + 50
  const lightness = Math.floor(50 * (boxPos.y / innerSquareSize + 0.5))
  console.log(lightness, saturation)
  return hslToHex(getDegree(degree), saturation, lightness)
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function positionByDegree(degree: number, radius: number): Position {
  return {
    x: radius * Math.cos((Math.PI * degree) / 180),
    y: radius * Math.sin((Math.PI * degree) / 180),
  };
}

function calculateDegree(event: MouseEvent | React.MouseEvent, target: HTMLDivElement): number {
  const rect = target.getBoundingClientRect();

  const relX = event.clientX - (rect.x + rect.width / 2);
  const relY = event.clientY - (rect.y + rect.height / 2);
  const norm = Math.sqrt(relX * relX + relY * relY);

  const degree = (180 / Math.PI) * Math.atan2(relY / norm, relX / norm);

  return degree;
}

let mouseUp: (() => void) | null;
let mouseMove: ((e: MouseEvent) => void) | null;

function absoluteToRelative(
  event: MouseEvent | React.MouseEvent,
  target: HTMLDivElement
): Position {
  const rect = target.getBoundingClientRect();

  const relX = event.clientX - (rect.x + rect.width / 2);
  const relY = event.clientY - (rect.y + rect.height / 2);

  return {
    x: clamp(relX, -rect.width / 2, rect.width / 2),
    y: clamp(relY, -rect.height / 2, rect.height / 2),
  };
}

function removeEvents() {
  if (mouseUp) document.removeEventListener('mouseup', mouseUp);
  if (mouseMove) document.removeEventListener('mousemove', mouseMove);
}
