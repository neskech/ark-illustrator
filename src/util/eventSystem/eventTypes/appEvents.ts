import { type ToolTypeName } from '~/drawingEditor/Input/toolSystem/tool';
import type { Func } from '~/util/general/utilTypes';

interface OpenSettings {
  openSettings: Func<void>;
}

interface ToolChanged {
  toolType: ToolTypeName;
}

type AppEventTypes = [OpenSettings, ToolChanged];
export default AppEventTypes;
