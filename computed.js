import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TriggerOpTypes } from "./operations";

function normalizeOptions(getterOrOptions) {
   let getter, setter;
   if (typeof getterOrOptions === 'function') {
       getter = getterOrOptions;
       setter = () => {
        console.warn(`Computed property "${key}" was assigned to but it has not setter`)
       };
   } else {
       getter = getterOrOptions.get;
       setter = getterOrOptions.set;
   }
   return { getter, setter };
}

export function computed(getterOrOptions) {
    const { getter, setter } = normalizeOptions(getterOrOptions);
    // cache the value so that we don't need to recompute it every time
    // dirty is used to check if the value is changed
    let value, dirty = true
    const effectFn = effect(getter, {
        lazy: true,
        scheduler() {
           dirty = true
            // when state has been changed, the value should be recomputed
           trigger(obj, TriggerOpTypes.SET, 'value')
        }
    });

    const obj = {
        get value() {
            // make effect to work
            track(obj, TrackOpTypes.GET, 'value')
            if (dirty) {
                value =  effectFn();
                dirty = false
            }
            return value
        },
        set value(newValue) {
            setter(newValue)
        }
    }

    return obj
}