import {reactive} from "./reactive.js"
import {effect} from "./effect.js"
import {ref} from "./ref.js"
import {computed} from "./computed.js"

const state = reactive({
  a: 1,
  b: 2
})

computed(() => {
  console.log('computed')
  return state.a + state.b
})