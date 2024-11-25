import { describe, test, expect, vi } from "vitest";
import { reactive } from "../reactive";
import { computed } from "../computed";
import { effect } from "../effect";

describe("computed", ()=> {
 test('should take a getter function', () => {
    const obj = {a: 1, b: 2}
    const state = reactive(obj)
    const fnSpy = vi.fn(() => {
        return state.a + state.b
    })
    const c = computed(fnSpy)
    // before read c.value, computed function should not be called
    expect(fnSpy).not.toHaveBeenCalled()
    expect(c.value).toBe(3)
    expect(fnSpy).toHaveBeenCalledTimes(1)

    // if we read c.value again, and c.value has not been changed, the computed function should not be called
    c.value
    c.value
    c.value
    expect(fnSpy).toHaveBeenCalledTimes(1)

    // if we change the state, when read c.value, the computed function should be called
    state.a++
    state.a++
    state.a++
    expect(fnSpy).toHaveBeenCalledTimes(1)
    expect(c.value).toBe(6)
    expect(fnSpy).toHaveBeenCalledTimes(2)
 })
 test('should work with effect', () => {
    // should setup relationship between sum.value with effect
    const obj = {a: 1, b: 2}
    const state = reactive(obj)
    const fnSpy = vi.fn(() => {
        return state.a + state.b
    })
    const effectSpy = vi.fn(() => {
        sum.value
    })
    const sum = computed(fnSpy)
    effect(effectSpy)
    state.a++
    expect(fnSpy).toHaveBeenCalledTimes(2)
    expect(effectSpy).toHaveBeenCalledTimes(2)
    expect(sum.value).toBe(4)
 })
 test('should take a options object', () => {})
})