import { type ToolTypeRef } from '~/application/drawingEditor/canvas/toolSystem/handler';
import { type GlobalToolSettings } from '../../application/drawingEditor/canvas/toolSystem/settings';

export interface SettingsObject {
  settings: GlobalToolSettings;
  selectedTool: ToolTypeRef;
}

export default interface EditorProps {
  settings: SettingsObject;
}
