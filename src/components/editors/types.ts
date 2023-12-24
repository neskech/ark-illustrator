import { type ToolTypeRef } from '~/utils/canvas/tools/handler';
import { type GlobalToolSettings } from '../../utils/canvas/tools/settings';

export interface SettingsObject {
    settings: GlobalToolSettings,
    selectedTool: ToolTypeRef
}

export default interface EditorProps {
    settings: SettingsObject
}