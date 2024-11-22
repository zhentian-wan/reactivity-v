import { describe, test, expect, vi } from "vitest";
import { effect } from "../effect";
import { reactive } from "../reactive";

describe('reactive/effect', () => {
    describe('effect function', () => {
        test('should run the passed function once (wrapped by a effect)', () => {
            const fnSpy = vi.fn(() => {})
            effect(fnSpy)
            expect(fnSpy).toHaveBeenCalledTimes(1)
        })
    })
    describe('trigger function', () => {
        test('should be called correct times', () => {
            const state = reactive({a: 1, b: 2, c: 3})
            const fnSpy = vi.fn(() => {
                console.log('fn')
                state.c;
                for (const key in state) {
                }
            })

            effect(fnSpy)
            state.c = 4
            expect(fnSpy).toHaveBeenCalledTimes(2)
        })
        test('should flow the control logic', () => {
            const state = reactive({a: 1, b: 2, c: 3})
            const fnSpy = vi.fn(() => {
                console.log('fn')
               if (state.a ===1 ) {
                state.b
               } else {
                state.c
               }
            })
            effect(fnSpy)
            state.a = 2
            state.b = 3 // after change a to 2, the deps in 'a' and 'c', nothing to do with 'b' anymore
            // therefore later you change 'b' should not trigger the function to run
            expect(fnSpy).toHaveBeenCalledTimes(2)
        })
        test('nested effect', () => {
            const state = reactive({a: 1, b: 2, c: 3})
            const innerSpy = vi.fn(() => {
                state.a
               })
            const fnSpy = vi.fn(() => {
               state.b;
               effect(innerSpy)
            })
            effect(fnSpy)
            state.b = 5
            expect(fnSpy).toHaveBeenCalledTimes(2)
            expect(innerSpy).toHaveBeenCalledTimes(2)
        })
        test('avoid max call stack', () => {
            const state = reactive({a: 1, b: 2, c: 3})
            const fnSpy = vi.fn(() => {
               state.a++;
            })
            effect(fnSpy)
            state.a = 2
            expect(fnSpy).toHaveBeenCalledTimes(1)
        })
        test('lazy effect', () => {
            const state = reactive({a: 1, b: 2, c: 3})
            const fnSpy = vi.fn(() => {
               state.a++;
            })
            const effectFn = effect(fnSpy, {lazy: true})
            expect(fnSpy).toHaveBeenCalledTimes(0)
            effectFn()
            expect(fnSpy).toHaveBeenCalledTimes(1)
        })
        test('scheduler effect', () => {
            const state = reactive({a: 1, b: 2, c: 3})
            const fnSpy = vi.fn(() => {
                state.a
            })
            let isRun = false
            const effectFn = effect(fnSpy, {lazy: true, scheduler: (eff) => {
                Promise.resolve().then(() => {
                    if (!isRun) {
                        isRun = true
                        eff()
                    }
                })
            }})
            effectFn()
            state.a++;
            state.a++;
            state.a++;
            state.a++;
            state.a++;
            state.a++;
            expect(state.a).toEqual(7)
            expect(fnSpy).toHaveBeenCalledTimes(1)
        })
        test.fails('batch updates', () => {
            const state = reactive({ a: 1, b: 2 })
            const fnSpy = vi.fn(() => {
                console.log(state.a + state.b)
            })
            effect(fnSpy)

            // Multiple updates
            state.a = 2
            state.b = 3
            expect(fnSpy).toHaveBeenCalledTimes(2) // TODO: better to reduced to 2 times
        })
    })
})