import type Func from "../util";

interface AppStateMutated {
    appStateMutated: Func<void>
}

interface OpenSettings {
    openSettings: Func<void>
}

type AppEventTypes = [AppStateMutated, OpenSettings]
export default AppEventTypes