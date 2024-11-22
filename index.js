import {reactive} from "./reactive.js"
import {effect} from "./effect.js"

const obj = {
        a: 1,
        b: 2
    }

const state = reactive(obj)

function fn1() {
  console.log('fn')
  state.c;
  for (const key in state) {
  }
}
effect(fn1)
state.c = 4


// function fn2() {
//     state.c
//     for (let key in state) {
//     }
//  }

// // 运行函数fn1， 运行期间用到的所有响应式数据，都会收集为对应关系
// // 就算innerFn中用到了响应式数据， 也只会关联到fn1
// effect(fn1)
// let isRun = false
// const effectFn = effect(fn2, {lazy: true, scheduler: (eff) => {
//     Promise.resolve().then(() => {
//         if (!isRun) {
//             isRun = true
//             eff()
//         }
//     })
// }})
// effectFn()