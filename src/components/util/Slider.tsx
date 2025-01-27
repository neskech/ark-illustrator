import { useEffect, useRef, useState } from 'react';

export interface SliderProps {
  label: string;
  rawValue: number;
  displayValue: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  units: string;
  round: boolean;
  width: string;
}

const normalize = (val: number, min: number, max: number) => {
    val = Math.min(max, Math.max(min, val))
    const v = (val - min) / (max - min)
    return v
  }

function Slider({ label, rawValue, displayValue, setValue, min, max, units, round, width }: SliderProps) {
  const [isDragging, setDragging] = useState(false);
  const [percentage, setPercentage] = useState(normalize(rawValue, min, max));
  const sliderRef = useRef<HTMLDivElement>(null);
  console.log("DEFAULT PERCENT", percentage)

  useEffect(() => {

    const handlerPointerUp = () => setDragging(false);

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      if (!sliderRef || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let percent = x / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      const uiPercentage = Math.round(percent * 100) / 100.0;
      setPercentage(uiPercentage);

      const range = max - min;
      let val = range * percent + min;

      if (round) val = Math.round(val);

      setValue(val);
    };

    document.addEventListener('pointerup', handlerPointerUp);
    document.addEventListener('pointermove', handlePointerMove);
    return () => {
      document.removeEventListener('pointerup', handlerPointerUp);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isDragging, max, min, round, setValue]);

  return (
    <div className="mb-4">
      <div className="mb-1">
        <span>{label}</span>
      </div>
      <div className="relative h-6 overflow-hidden rounded bg-neutral-700" style={{ width: width }}>
        <div
          className="absolute inset-0 bg-neutral-600"
          style={{ width: `${percentage * 100}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-end px-2">
          <span className="text-xs tabular-nums">
            {displayValue}
            {units}
          </span>
        </div>
        <div
          ref={sliderRef}
          onPointerDown={(_) => setDragging(true)}
          className="absolute inset-0 cursor-pointer opacity-0"
        ></div>
      </div>
    </div>
  );
}

export default Slider;
