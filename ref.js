import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operations"

export function ref(value) {
    return {
        get value() {
            track(this, TrackOpTypes.GET, 'value')
            return value
        },
        set value(newValue) {
            value = newValue
            trigger(this, TriggerOpTypes.SET, 'value')
        }
    }
}