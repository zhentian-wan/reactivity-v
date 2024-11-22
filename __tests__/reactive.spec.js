import { describe, test, expect, vi } from "vitest";
import { reactive } from "../reactive.js";
import * as effect from '../effect.js';
import { afterEach } from "vitest";

describe("vue/reactive", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.resetAllMocks()
    })
    describe('object', () => {
        describe('read operation', () => {
            test('should receive an object', () => {
                const notObj = 123
                const state = reactive(notObj)
                expect(state).toStrictEqual(notObj)
            })
            test('should return the same proxy for the same object', () => {
                const obj = {}
                const state = reactive(obj)
                const state2 = reactive(obj)
                expect(state).toStrictEqual(state2)
            })
            test('should return the itself if the object is already a proxy', () => {
                const obj = {}
                const state1 = reactive(obj)
                const state2 = reactive(state1)
                expect(state1).toStrictEqual(state2)
            })
            test("should work with a basic object", () => {
                const obj = {
                    a: 1,
                    b: 2,
                };
                const state = reactive(obj);
                const trackMock = vi.spyOn(effect, "track");
                const triggerMock = vi.spyOn(effect, "trigger");
                const a = state.a;
                const b = state.b;
                expect(trackMock).toHaveBeenCalledTimes(2);
                expect(trackMock).toHaveBeenCalledWith(obj, "get", "a");
                expect(trackMock).toHaveBeenLastCalledWith(obj, "get", "b");
                expect(triggerMock).toHaveBeenCalledTimes(0);
                state.a = 2
                expect(triggerMock).toHaveBeenCalledTimes(1);
                expect(triggerMock).toHaveBeenCalledWith(obj, "set", "a");
            });
            test('should handler getter with this pointer', () => {
                const obj = {
                    a: 1,
                    b: 2,
                    get c() {
                        console.log(this)
                        return this.a + this.b
                    }
                }
                const trackMode = vi.spyOn(effect, 'track')
                const state = reactive(obj)
                const c = state.c
                expect(c).toBe(3)
                // Wrong bahavior: only track 'c'
                // We expect, 'a' and 'b' to be tracked as well
                // therefore call track 3 times
                expect(trackMode).toHaveBeenCalledTimes(3)
                expect(trackMode).toHaveBeenCalledWith(obj, 'get', 'c')
                expect(trackMode).toHaveBeenCalledWith(obj, 'get', 'a')
                expect(trackMode).toHaveBeenLastCalledWith(obj, 'get', 'b')
            })
            test('handle nested object', () => {
                const obj = {
                    a: 1,
                    b: 2,
                    c: {
                        d: 3
                    }
                }
                const trackMode = vi.spyOn(effect, 'track')
                const state = reactive(obj)
                const d = state.c.d;
                expect(d).toBe(3)
                // Wrong behavior, only track 'c'
                // We expect, it should track 'c' and 'd' as well
                expect(trackMode).toHaveBeenCalledTimes(2)
                expect(trackMode).toHaveBeenCalledWith(obj, 'get', 'c')
                expect(trackMode).toHaveBeenLastCalledWith(obj.c, 'get', 'd')
            })
            // https://262.ecma-international.org/15.0/index.html?_gl=1*1wddf7i*_ga*MjAxMzMxOTcxMy4xNzMxNzgzMzU4*_ga_TDCK4DWEPP*MTczMTc4MzM1Ny4xLjAuMTczMTc4MzM1Ny4wLjAuMA..#prod-RelationalExpression
            test('check has property [[hasProperty]] in object', () => {
                const obj = {
                    a: 1,
                    b: 2
                }
                const trackMock= vi.spyOn(effect, 'track')
                const state = reactive(obj)
                const hasA = 'a' in state
                expect(hasA).toBeTruthy()
                expect(trackMock).toHaveBeenCalledTimes(1)
                expect(trackMock).toHaveBeenCalledWith(obj, 'has', 'a')
            })
            // https://262.ecma-international.org/15.0/index.html?_gl=1*1wddf7i*_ga*MjAxMzMxOTcxMy4xNzMxNzgzMzU4*_ga_TDCK4DWEPP*MTczMTc4MzM1Ny4xLjAuMTczMTc4MzM1Ny4wLjAuMA..#sec-for-in-iterator-objects
            test('check for .. in loop - Reflect.ownKeys', () => {
                const obj = {
                    a: 1,
                    b: 2
                }
                const trackMock= vi.spyOn(effect, 'track')
                const state = reactive(obj)
                for (let key in state) {
                }
                expect(trackMock).toHaveBeenCalledTimes(1)
                expect(trackMock).toHaveBeenCalledWith(obj, 'iterate')
                Object.keys(state)
                expect(trackMock).toHaveBeenCalledTimes(2)
                expect(trackMock).toHaveBeenCalledWith(obj, 'iterate')
            })
        })
        describe('write/delete operation', () => {
            test('check set operation', () => {
                const obj = {
                    a: 1
                }
                const triggerMock = vi.spyOn(effect, 'trigger')
                const state = reactive(obj)
                state.a = 2
                expect(triggerMock).toHaveBeenCalledTimes(1)
                expect(triggerMock).toHaveBeenCalledWith(obj, 'set', 'a')
                state.b = 3
                expect(triggerMock).toHaveBeenCalledTimes(2)
                expect(triggerMock).toHaveBeenCalledWith(obj, 'add', 'b')
            })
            test('should not trigger for set operation if the value is the same', () => {
                const obj = {
                    a: 0
                }
                const triggerMock = vi.spyOn(effect, 'trigger')
                const state = reactive(obj)
                state.a = -0
                expect(triggerMock).toHaveBeenCalledTimes(1)
                // Add operation should trigger, even the value doesn't change (from undefined to undefined)
                state.b = undefined
                expect(triggerMock).toHaveBeenCalledTimes(2)

            })
            test('check delete operation', () => {
                const obj = {
                    a: 1
                }
                const triggerMock = vi.spyOn(effect, 'trigger')
                const state = reactive(obj)
                delete state.a
                expect(triggerMock).toHaveBeenCalledTimes(1)
                expect(triggerMock).toHaveBeenCalledWith(obj, 'delete', 'a')
            })
            test('should not trigger for delete operation if the property does not exist', () => {
                const obj = {
                    a: 1
                }
                const triggerMock = vi.spyOn(effect, 'trigger')
                const state = reactive(obj)
                delete state.b
                expect(triggerMock).toHaveBeenCalledTimes(0)
            })
        })
    })
    describe('array', () => {
        describe('read operations', () => {
            test('read simple array operations', () => {
                const arr = [1,2]
                const state = reactive(arr)
                const trackMock = vi.spyOn(effect, 'track')
                const a = state[0]
                expect(trackMock).toHaveBeenCalledTimes(1)
                expect(trackMock).toHaveBeenLastCalledWith(arr, 'get', '0')

                const len = state.length
                expect(trackMock).toHaveBeenCalledTimes(2)
                expect(trackMock).toHaveBeenLastCalledWith(arr, 'get', 'length')

                const lio = state.lastIndexOf(1)
                expect(trackMock).toHaveBeenCalledWith(arr, 'get', 'lastIndexOf')
            })
            test('ready array contains object', () => {
                const obj = {a: 1}
                const arr = [1, obj]
                const state = reactive(arr)
                // due to when the get handler, when the value is an object
                // it was wrapped with reactive, using indexOf to find original object
                // won't work
                // there are two ways to solve this issue:
                // 1. Convert the original obj to proxy
                // 2. When we are not able to find in proxy, try again in original array
                const o = state.indexOf(obj)
                expect(o).toEqual(1)
            })
        })
        describe('set operations', () => {
            test('basic set operations', () => {
                const arr = [1,2]
                const state = reactive(arr)
                const triggerMock = vi.spyOn(effect, 'trigger')
                state[0] = 2
                expect(triggerMock).toHaveBeenCalledTimes(1)
                expect(triggerMock).toHaveBeenCalledWith(arr, 'set', '0')
            })
            test('should handle length increase operation', () => {
                const arr = [1,2]
                const state = reactive(arr)
                const triggerMock = vi.spyOn(effect, 'trigger')
                state.length = 3
                expect(triggerMock).toHaveBeenCalledTimes(1)
                expect(triggerMock).toHaveBeenCalledWith(arr, 'set', 'length')

                state[4] = 5
                // arr[outOfBoundIndex] = newValue, length will be changed
                // but the way it changes is using by using Object.defineProperty(arr, 'length', {value: newLen})
                // which won't trigger the set operation in proxy
                // So when it meets the following condition, it will trigger the set operation
                // 1. is Array
                // 2. length is changed
                // 3. key is not length itself
                expect(triggerMock).toHaveBeenCalledTimes(3)
                expect(triggerMock).toHaveBeenCalledWith(arr, 'add', '4')
                expect(triggerMock).toHaveBeenCalledWith(arr, 'set', 'length')
            })
            test('should handle length decrease operation', () => {
                const arr = [1,2,3]
                const state = reactive(arr)
                const triggerMock = vi.spyOn(effect, 'trigger')
                state.length = 1
                // set length
                // delete 2 (index)
                // delete 1 (index)
                expect(triggerMock).toHaveBeenCalledTimes(3)
                expect(triggerMock).toHaveBeenCalledWith(arr, 'set', 'length')
                expect(triggerMock).toHaveBeenCalledWith(arr, 'delete', '1')
                expect(triggerMock).toHaveBeenCalledWith(arr, 'delete', '2')
            })
            test('mutation operations should not trigger length tracking', () => {
                const arr = [1,2]
                const state = reactive(arr)
                const triggerMock = vi.spyOn(effect, 'trigger')
                const trackMock = vi.spyOn(effect, 'track')
                const pauseTrackingMock = vi.spyOn(effect, 'pauseTracking')
                const resumeTrackingMock = vi.spyOn(effect, 'resumeTracking')
                expect(pauseTrackingMock).toHaveBeenCalledTimes(0)
                expect(resumeTrackingMock).toHaveBeenCalledTimes(0)
                state.push(4)
                expect(triggerMock).toHaveBeenCalledTimes(2)
                expect(triggerMock).toHaveBeenCalledWith(arr, 'add', '2')
                expect(triggerMock).toHaveBeenCalledWith(arr, 'set', 'length')
                expect(trackMock).toHaveBeenCalledWith(arr, 'get', 'push')
                // after push operation, length tracking should not happen
                // there are 2 ways to resolve the issue
                // 1. Override all the mothods which cause array mutation
                // 2. Pause and resume tracking
                // We use No.2
                expect(pauseTrackingMock).toHaveBeenCalledTimes(1)
                expect(resumeTrackingMock).toHaveBeenCalledTimes(1)
            })
        })
    })
});


