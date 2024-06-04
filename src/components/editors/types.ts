import { type ToolTypeRef } from '~/drawingEditor/canvas/toolSystem/handler';
import { type GlobalToolSettings } from '../../drawingEditor/canvas/toolSystem/settings';

export interface SettingsObject {
  settings: GlobalToolSettings;
  selectedTool: ToolTypeRef;
}

export default interface EditorProps {
  settings: SettingsObject;
}
