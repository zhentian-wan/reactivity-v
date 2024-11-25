import { describe, test, expect, vi } from "vitest";
import { ref } from "../ref"
import { effect } from "../effect"

describe("Ref", () => {
    test("should work", () => {
        const state = ref(1)
        const fnSpy = vi.fn(() => {
            state.value
        })
        effect(fnSpy)
        state.value++
        expect(fnSpy).toBeCalledTimes(2)
        expect(state.value).toBe(2)
    })
})