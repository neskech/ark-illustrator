import { ToolType } from '~/drawingEditor/canvas/toolSystem/handler';
import type { Func } from '~/util/general/utilTypes';

interface AppStateMutated {
    appStateMutated: Func<void>
}

interface OpenSettings {
    openSettings: Func<void>
}

interface ToolChanged {
    toolType: ToolType
}

type AppEventTypes = [AppStateMutated, OpenSettings, ToolChanged]
export default AppEventTypes
