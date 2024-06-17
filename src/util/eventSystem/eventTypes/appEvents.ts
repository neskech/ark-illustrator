
import { type ToolType } from '~/drawingEditor/canvas/toolSystem/inputManager';
import type { Func } from '~/util/general/utilTypes';

interface OpenSettings {
    openSettings: Func<void>
}

interface ToolChanged {
    toolType: ToolType
}

type AppEventTypes = [OpenSettings, ToolChanged]
export default AppEventTypes
