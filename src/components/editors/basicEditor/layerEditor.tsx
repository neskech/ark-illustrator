import { useContext, useState } from 'react';
import { EditorContext } from '~/components/editorWrapper';
import Layer from '~/drawingEditor/canvas/layer';
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

// function uniqueNameFromHandles(name: string, handles: LayerHandle[]) {
//   const names = handles.map((h) => h.name);
//   while (names.includes(name)) {
//     name += ` {}`;
//   }

//   return '';
// }

function LayerEditor() {
  const context = useContext(EditorContext);
  const handles = context.layerManager.getLayers().map(layerToLayerHandle);
  const [layers, setLayers] = useState<LayerHandle[]>(handles);
  const [selection, setSelection] = useState(0);

  function swapLayers(fromIndex: number, toIndex: number) {
    const layersCopy = [...layers];
    fromIndex = Math.min(fromIndex, toIndex);
    toIndex = Math.max(fromIndex, toIndex);

    const fromLayer = layersCopy[fromIndex];
    const toLayer = layersCopy[toIndex];
    layersCopy.splice(toIndex, 1, fromLayer);
    layersCopy.splice(fromIndex, 1, toLayer);
    setLayers(layersCopy);

    context.layerManager.swapLayers(fromIndex, toIndex);

    if (selection == fromIndex)
      setSelection(toIndex)
    else if (selection == toIndex)
      setSelection(fromIndex)
  }

  function insertLayer(insertionIndex: number) {
    const name = `Layer #${layers.length + 1}`;
    context.layerManager.insertNewLayer(name, insertionIndex);
    console.log('YEAHHHHH', context.layerManager.getLayers().length);
    setLayers(context.layerManager.getLayers().map(layerToLayerHandle));
  }

  function deleteLayer(index: number) {
    if (layers.length == 1) return;
    context.layerManager.deleteLayer(index);

    const layersCopy = [...layers];
    layersCopy.splice(index, 1)
    setLayers(layersCopy)
  }

  function changeVisibility(index: number, val: boolean) {
    context.layerManager.getLayers()[index].setVisibility(val);
    setLayers(context.layerManager.getLayers().map(layerToLayerHandle));
  }

  function changeSelection(index: number) {
    context.layerManager.switchToLayer(index);
    setSelection(index);
  }

  return (
    <div className="w-full overflow-hidden rounded-lg bg-[#2A2A2A] pl-2 pr-2 text-white shadow-xl">
      {/* Top Controls */}
      <div className="flex items-center gap-2 border-b border-[#3A3A3A] p-2">
        <span className="text-sm">opacity</span>
        <div className="flex-1">
          {/* <Slider defaultValue={[100]} max={100} step={1} className="w-full" /> */}
        </div>
        <span className="text-sm">100%</span>
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
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
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
        <Button variant="ghost" size="icon" className="bg-[#3A3A3A]">
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
      <div className="max-h-[80px] overflow-y-scroll">
        {layers.map((handle, index) => (
          <LayerComponent
            key={index}
            handle={handle}
            isSelected={selection == index}
            onLayerSelect={() => changeSelection(index)}
            onVisibilityChange={(v) => changeVisibility(index, v)}
          />
        ))}
      </div>
    </div>
  );
}

export default LayerEditor;
