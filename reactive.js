
import {handlers as basicHandlers} from './basicHandlers.js'

import { isObject } from './utils.js'

const targetMap = new WeakMap()

export function reactive(target) {
    if (!isObject(target)) {
        return target
    }
    if (targetMap.has(target)) {
        return targetMap.get(target)
    }
    const proxy = new Proxy(target, basicHandlers)
    targetMap.set(target, proxy)
    return proxy
}