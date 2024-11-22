// Use for Object, Array
import {pauseTracking, resumeTracking, track, trigger} from './effect.js'
import {TrackOpTypes, TriggerOpTypes} from "./operations.js"
import { reactive } from './reactive.js'
import { hasChanged, hasOwn, isObject } from './utils.js'

const arrayInstrumentations = {};
const RAW = Symbol('raw');

['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
    arrayInstrumentations[key] = function(...args) {
        // 1. search in proxy
        const res = Array.prototype[key].apply(this, args)
        // 2. search in original array
        if (res === -1 || res === false) {
            return Array.prototype[key].apply(this[RAW], args)
        }
        return res
    }
});
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
    arrayInstrumentations[key] = function(...args) {
        pauseTracking()
        const res = Array.prototype[key].apply(this, args)
        resumeTracking()
        return res;
    }
})

function deleteProperty(target, key) {
    const hasKey = target.hasOwnProperty(key)
    const res = Reflect.deleteProperty(target, key)
    if (hasKey && res) {
        trigger(target, TriggerOpTypes.DELETE, key)
    }
   return res
}

function get(target, key, receiver) {
    if (key === RAW) {
        return target
    }
    track(target, TrackOpTypes.GET, key)
    if (hasOwn(arrayInstrumentations, key) && Array.isArray(target)) {
        return arrayInstrumentations[key]
    }
    //  handler getter with this pointer
    const result = Reflect.get(target, key, receiver)
    // handle nested object
    if (isObject(result)) {
        return reactive(result)
    }
    return result
}

function set(target, key, value, receiver) {
    const typeOperation = target.hasOwnProperty(key) ? TriggerOpTypes.SET : TriggerOpTypes.ADD
    const oldValue = target[key]
    const oldLen = Array.isArray(target) ? target.length : undefined;
    const res = Reflect.set(target, key, value, receiver)
    if (!res) {
        return res
    }
    const newLen = Array.isArray(target) ? target.length : undefined;
    if (hasChanged(oldValue, value) || typeOperation === TriggerOpTypes.ADD) {
        trigger(target, typeOperation, key)

        if (Array.isArray(target) &&  oldLen !== newLen) {
            if (key !== 'length') {
                trigger(target, TriggerOpTypes.SET, 'length')
            } else {
                for (let i = newLen; i < oldLen; i++) {
                    trigger(target, TriggerOpTypes.DELETE, i.toString())
                }
            }

        }
    }
    return res
}

function has(target, key) {
    track(target, TrackOpTypes.HAS, key)
    return Reflect.has(target, key)
}

function ownKeys(target) {
    track(target, TrackOpTypes.ITERATE)
    return Reflect.ownKeys(target)
}

export const handlers = {
    deleteProperty,
    get,
    set,
    has,
    ownKeys
}