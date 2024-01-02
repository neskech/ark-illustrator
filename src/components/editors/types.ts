import { type ToolTypeRef } from '~/application/drawingEditor/canvas/tools/handler';
import { type GlobalToolSettings } from '../../application/drawingEditor/canvas/tools/settings';

export interface SettingsObject {
  settings: GlobalToolSettings;
  selectedTool: ToolTypeRef;
}

export default interface EditorProps {
  settings: SettingsObject;
}
