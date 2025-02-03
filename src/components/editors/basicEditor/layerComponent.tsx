import { Eye, EyeOff, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import type Layer from '~/drawingEditor/canvas/layer';
import { LayerHandle } from './layerEditor';

export interface LayerProps {
  handle: LayerHandle
  isSelected: boolean;
  onLayerSelect: () => void;
  onVisibilityChange: (v: boolean) => void
}

function LayerComponent({ handle,  isSelected,  onLayerSelect, onVisibilityChange }: LayerProps) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-2 p-2 hover:bg-[#3A3A3A] ${
        isSelected ? 'bg-[#3A3A3A]' : ''
      }`}
      onClick={() => onLayerSelect()}
    >
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onVisibilityChange(!handle.isVisible);
        }}
      >
        {handle.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>
      <div className="h-8 w-8 flex-shrink-0 rounded border border-[#5A5A5A] bg-[#4A4A4A]" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{handle.name}</div>
        <div className="truncate text-xs text-gray-400">
          {handle.blendMode} {Math.round(handle.opacity * 100)}%
        </div>
      </div>
    </div>
  );
}

export default LayerComponent;
