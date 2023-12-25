/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { clamp } from 'curve-interpolator';
import { type Float32Vector3 } from 'matrixgl';
import React, { useEffect, useRef, useState } from 'react';
import { type BrushSettings } from '~/utils/canvas/tools/brush';
import { hslToHex, hslToRGBNormalized } from '~/utils/misc/color';

const DEGREE_OFFSET = 90;

export interface ColorPickerProps {
  size: number;
  brushSettings: BrushSettings;
}

interface Position {
  x: number;
  y: number;
}

interface PickerProps {
  x: number;
  y: number;
}

let pointerUp: (() => void) | null;
let pointerMove: ((e: MouseEvent) => void) | null;

function Picker({ x, y }: PickerProps) {
  return (
    <div
      className="pointer-events-none absolute z-40 h-3 w-3 rounded-full border-2 border-black bg-white"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    ></div>
  );
}

function ColorPicker(props: ColorPickerProps) {
  const innerSquareSize = Math.floor(props.size * 0.56);

  const [isOuterHeld, setOuterHeld] = useState(false);
  const [degree, setDegree] = useState(0);

  const [isInnerHeld, setInnerHeld] = useState(false);
  const [innerPos, setInnerPos] = useState<Position>({ x: 0, y: 0 });

  const outerCircle = useRef<HTMLDivElement>(null);
  const innerSquare = useRef<HTMLDivElement>(null);

  /* TODO: Picker fucks us up. Forward the picker ref */

  useEffect(() => {
    removeEvents();

    pointerUp = () => {
      setOuterHeld(false);
      setInnerHeld(false);
    };
    document.addEventListener('pointerup', pointerUp);
    document.addEventListener('pointercancel', pointerUp);

    pointerMove = (e: MouseEvent) => {
      const rect = outerCircle.current!.getBoundingClientRect();
      const dx = e.clientX - (rect.x + rect.width / 2);
      const dy = e.clientY - (rect.y + rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 100) {
        setInnerHeld(false);
        setOuterHeld(false);
        return;
      }

      if (isOuterHeld && !isInnerHeld) {
        setDegree(calculateDegree(e, outerCircle.current!));
      } else if (isInnerHeld && !isOuterHeld) {
        setInnerPos(absoluteToRelative(e, innerSquare.current!));
      }
    };
    document.addEventListener('pointermove', pointerMove);

    return removeEvents;
  }, [isOuterHeld, isInnerHeld]);

  useEffect(() => {
    props.brushSettings.color = getRGBFromParams(degree, innerPos, innerSquareSize);
  }, [degree, innerPos]);

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
        className="absolute border-2 border-white"
        style={{
          width: `${Math.floor(props.size * 0.25)}px`,
          height: `${Math.floor(props.size * 0.25)}px`,
          backgroundColor: getColorFromParams(degree, innerPos, innerSquareSize),
          transform: 'translate(-163%, -235%)',
        }}
      ></div>

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

function getRGBFromParams(
  degree: number,
  boxPos: Position,
  innerSquareSize: number
): Float32Vector3 {
  const saturation = Math.floor(50 * (boxPos.x / innerSquareSize + 0.5)) + 50;
  const lightness = Math.floor(50 * (boxPos.y / innerSquareSize + 0.5));
  return hslToRGBNormalized(getDegree(degree), saturation, lightness);
}

function getColorFromParams(degree: number, boxPos: Position, innerSquareSize: number): string {
  const saturation = Math.floor(50 * (boxPos.x / innerSquareSize + 0.5)) + 50;
  const lightness = Math.floor(50 * (boxPos.y / innerSquareSize + 0.5));
  return hslToHex(getDegree(degree), saturation, lightness);
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
  if (pointerUp) {
    document.removeEventListener('pointerup', pointerUp);
    document.removeEventListener('pointercancel', pointerUp);
  }
  if (pointerMove) document.removeEventListener('pointermove', pointerMove);
}
