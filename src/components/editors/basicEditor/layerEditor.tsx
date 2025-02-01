import { useContext, useEffect, useState } from 'react';
import { EditorContext } from '~/components/editorWrapper';
import type Layer from '~/drawingEditor/canvas/layer';
import LayerComponent from './layerComponent';
import { Button } from '~/components/ui/button';
import { ArrowDown, Layers, Lock, Minus, Move, Plus, Search, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import Slider from '~/components/ui/Slider';
import { motion, AnimatePresence } from 'framer-motion';

export interface LayerHandle {
  name: string;
  isVisible: boolean;
  isLocked: boolean;
  opacity: number;
}

function layerToLayerHandle(layer: Layer): LayerHandle {
  return {
    name: layer.getName(),
    isVisible: layer.getVisibility(),
    isLocked: layer.getLocked(),
    opacity: layer.getOpacity(),
  };
}

// Always returns a positive result
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function LayerEditor() {
  const layerManager = useContext(EditorContext).layerManager;
  const handles = layerManager.getLayers().map(layerToLayerHandle);
  const [layers, setLayers] = useState<LayerHandle[]>(handles);
  const [selection, setSelection] = useState(0);

  function reverseIndex(n: number) {
    return layers.length - 1 - n;
  }

  function swapLayers(fromIndex: number, toIndex: number) {
    const layersCopy = [...layers];
    const tmp = layersCopy[fromIndex];
    layersCopy[fromIndex] = layersCopy[toIndex];
    layersCopy[toIndex] = tmp;
    setLayers(layersCopy);

    layerManager.swapLayers(fromIndex, toIndex);

    if (selection == fromIndex) setSelection(toIndex);
    else if (selection == toIndex) setSelection(fromIndex);
  }

  function insertLayer(insertionIndex: number) {
    const name = `Layer #${layers.length + 1}`;
    layerManager.insertNewLayer(name, insertionIndex);
    setLayers(layerManager.getLayers().map(layerToLayerHandle));
  }

  function deleteLayer(index: number) {
    if (layers.length == 1) return;
    layerManager.deleteLayer(index);

    const layersCopy = [...layers];
    layersCopy.splice(index, 1);
    setLayers(layersCopy);

    if (selection == index) {
      setSelection(mod(selection - 1, layersCopy.length));
    }
  }

  function duplicateLayer(index: number) {
    const name = layers[index].name;
    let newName = name + ' copy';

    if (handles.some((h) => h.name == newName)) newName += ' #2';

    const filterRegex = new RegExp(`^${name} copy #\\d+$`);
    const matches = handles.filter((h) => filterRegex.test(h.name));
    if (matches.length > 0) {
      const maxCopy = matches.reduce((prev, curr) => {
        const split = curr.name.split(' ');
        const num = Number.parseInt(split[split.length - 1].slice(1));
        return Math.max(prev, num);
      }, -Infinity);
      newName = `${name} copy #${maxCopy + 1}`;
    }

    const insertionIndex = Math.max(index - 1, 0);
    layerManager.duplicateLayer(newName, insertionIndex, index + 1);
    setLayers(layerManager.getLayers().map(layerToLayerHandle));
  }

  function changeVisibility(index: number, val: boolean) {
    layerManager.getLayers()[index].setVisibility(val);
    setLayers(layerManager.getLayers().map(layerToLayerHandle));
  }

  function changeSelection(index: number) {
    layerManager.switchToLayer(index);
    setSelection(index);
  }

  function changeOpacity(index: number, val: number) {
    layerManager.getLayers()[index].setOpacity(val);
    setLayers(layerManager.getLayers().map(layerToLayerHandle));
  }

  function changeLocked(index: number) {
    const layer = layerManager.getLayers()[index];
    layer.setLocked(!layer.getLocked());
    setLayers(layerManager.getLayers().map(layerToLayerHandle));
  }

  return (
    <div className="w-full overflow-hidden rounded-lg bg-[#2A2A2A] pl-2 pr-2 text-white shadow-xl">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <span className="pl-1 text-[0.90rem] text-white">opacity</span>
        <Slider
          rawValue={layers[selection].opacity}
          displayValue={Math.round(layers[selection].opacity * 100)}
          setValue={(o) => changeOpacity(selection, o)}
          min={0}
          max={1}
          units={'%'}
          round={false}
          width="160px"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-[#3A3A3A] p-2">
        <Select defaultValue="normal">
          <SelectTrigger className="w-[100px] border-0 bg-[#3A3A3A]">
            <SelectValue placeholder="Blend" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">normal</SelectItem>
            <SelectItem value="multiply">multiply</SelectItem>
            <SelectItem value="screen">screen</SelectItem>
            <SelectItem value="overlay">overlay</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#3A3A3A]"
          onClick={() => duplicateLayer(selection)}
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto bg-[#3A3A3A]"
          onClick={() => insertLayer(layers.length)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-7 gap-1 border-b border-[#3A3A3A] p-2">
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#3A3A3A]"
          onClick={() => changeLocked(selection)}
        >
          <Lock className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
          <Move className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#3A3A3A]"
          onClick={() => deleteLayer(selection)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Layers List */}
        <AnimatePresence initial={false}>
          {layers.toReversed().map((handle, index) => (
            <motion.ol
              key={index}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <LayerComponent
                key={index}
                handle={handle}
                isSelected={selection == reverseIndex(index)}
                onLayerSelect={() => changeSelection(reverseIndex(index))}
                onVisibilityChange={(v) => changeVisibility(reverseIndex(index), v)}
              />
            </motion.ol>
          ))}
        </AnimatePresence>
    </div>
  );
}

export default LayerEditor;
