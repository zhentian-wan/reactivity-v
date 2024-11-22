import {TrackOpTypes, TriggerOpTypes} from "./operations.js"
import {triggerTypeMap} from "./operations.js"

const targetMap = new WeakMap()
const ITERATE_KEY = Symbol('iterate')
const effectStack = []
let activeEffect = undefined
let shouldTrack = true;

export function pauseTracking() {
    shouldTrack = false;
}

export function resumeTracking() {
    shouldTrack = true;
}

export function effect(fn, options = {}) {
    const {lazy= false} = options
    // 收集依赖不是直接收集fn函数，而是直接收集effectFn运行环境
   const effectFn = () => {
    try {
        activeEffect = effectFn
        effectStack.push(effectFn)
        cleanup(effectFn)
        return fn()
    } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
    }
   }
   effectFn.deps = []
   effectFn.options = options
   if (!lazy) {
    effectFn()
   }

   return effectFn
}

export function cleanup(effectFn) {
    const {deps} = effectFn
    console.log('deps', deps)
    if (deps.length) {
        for (const dep of deps) {
            dep.delete(effectFn)
        }
        deps.length = 0
    }
}

function getEffectFns(target, type, key) {
    const propMap = targetMap.get(target)
    if (!propMap) {
        return
    }
    const keys = [key]
    if (type === TriggerOpTypes.ADD || type === TriggerOpTypes.DELETE) {
        keys.push(ITERATE_KEY)
    }

    const effectFns = new Set()
    for (const key of keys) {
        const typeMap = propMap.get(key)
        if (!typeMap) {
            continue
        }
        const trackTypes = triggerTypeMap[type]
        for (const trackType of trackTypes) {
            const dep = typeMap.get(trackType)
            if (!dep) {
                continue
            }
            for (const effectFn of dep) {
                effectFns.add(effectFn)
            }
        }
    }
    return effectFns
}

// 依赖收集
export function track(target, type, key) {
    if (!shouldTrack || !activeEffect) {
        return
    }
    if (type === TrackOpTypes.ITERATE) {
        console.log(`%c [${type}]`, 'color: #f00')
        return
    }
    let propMap = targetMap.get(target)
    if (!propMap) {
        propMap = new Map()
        targetMap.set(target, propMap)
    }
    if (type === TrackOpTypes.ITERATE) {
        key = ITERATE_KEY
    }
    let typeMap = propMap.get(key)
    if (!typeMap) {
        typeMap = new Map()
        propMap.set(key, typeMap)
    }
    let depSet = typeMap.get(type)
    if (!depSet) {
        depSet = new Set()
        typeMap.set(type, depSet)
    }
    if (!depSet.has(activeEffect)) {
        depSet.add(activeEffect)
        activeEffect.deps.push(depSet)
    }
    console.log(`%c Track [${type}]`, 'color: #f00', key, targetMap)
}

// 触发更新
export function trigger(target, type, key) {
    const effectFns = getEffectFns(target, type, key)
    if (!effectFns) {
        return
    }
    for (const effectFn of effectFns) {
        if (effectFn === activeEffect) {
            // to avoid state.a++, infinite loop case
           continue
        }
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn)
        } else {
            effectFn()
        }
    }
    console.log(`%c Trigger [${type}]`, 'color: #00f', key)
}