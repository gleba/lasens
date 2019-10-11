import { test } from './ouput.shema'

// import { holistic, qubit } from '../src/decor'
import set = Reflect.set
import {holistic, LaSens, qubit} from "../src";
import {ISens} from "../src/core";

import {LaVue} from "../src/vue";
import {La} from "../src/core/dynamique";
La


const apiMockGetTo = (path, id) =>
  new Promise(done => {
    const name = path.slice(1)
    if (name === 'profile')
      setTimeout(
        () =>
          done({
            id,
            [name]: name + id,
          }),
        24
      )
    else {
      setTimeout(() => {
        let ar = Array(Math.round(1+Math.random() * 7)).fill(0)
        ar = ar.map((z, i) => i + ':' + id + '-' + name)
        done(ar)
      }, 64)
    }
  })

export class BaseModule {
  @qubit userId: number
  @holistic profile
  @holistic followers
  @holistic tweets

  a1 = "wait1"
  a2 = "wait2"
  a3 = "wait3"

  actions({f}:La<BaseModule>) {

    f.userId.up(id => {
      f.profile(apiMockGetTo('/profile', id))
      f.followers(apiMockGetTo('/followers', id))
      f.tweets(apiMockGetTo('/tweets', id))
    })

    return {
      generateUserId() {
        f.userId(Math.floor(Math.random()*999999+100))
        this.a1("done")
      },
      a1(v){
        f.a1(v)
      },
      async action2(){
        return new Promise(done=>setTimeout(v=>done(true),200))
      }
    }
  }
}

const modules = {
  base: BaseModule,
}

type XStore = ISens<typeof modules>


// const Vue = require("vue")

// const Vue = _Vue
// console.log(_Vue.use)


require('jsdom-global')()
var testUtils=require('@vue/test-utils'), Vue=require('vue');
const MyComponent = {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <span class="xxx">{{ xxx }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data () {
    console.log("≃")

    return {
      count: 0
    }
  },

  use({base}){
    // console.log("i can use")

    base.a2.as("xxx")
    // base.a2.as("count")
    base.a3.up(x=>{
      console.log("up!", this.count)
      this.count = 3
      this.xxx = x+"xxx!"
    })
    // this.count = 2
    console.log("→", this.count)

  },
  methods: {
    increment () {
      this.count++
    }
  }
}

// console.log(typeof MyComponent)
let store = LaSens(modules)
store.renew()

// console.log(store.flows.base.a1.v)

const laVue = LaVue(store)
const localVue = testUtils.createLocalVue()
localVue.use(laVue)
//
const wrapper = testUtils.mount(MyComponent, {localVue})
console.log(wrapper.html())
// store.flows.base.a2("new")
store.flows.base.a3("new")
console.log(wrapper.html())
wrapper.destroy()
// wrapper.$mou
// alak()
// test('vue', async ({ ok, end, fall, plan }) => {
//   let store = LaSens(modules)
//   const laVue = LaVue(store)
//   store.renew()
//
//   // console.log(Vue)
//
//   Vue.use(laVue)
//
//   let wm = new Vue({
//
//     data: function () {
//       return {
//         templateText: "xx",
//       }
//     },
//
//     computed: {
//       result: function () {
//         if (!this.templateText) {
//           return 'Enter a valid template above'
//         }
//
//         try {
//           var result = Vue.compile(this.templateText.replace(/\s{2,}/g, ''))
//
//           return {
//             render: this.formatFunction(result.render),
//             staticRenderFns: result.staticRenderFns.map(this.formatFunction)
//           }
//         } catch (error) {
//           return error.message
//         }
//       }
//     },
//
//     methods: {
//       formatFunction: function (fn) {
//         return fn.toString().replace(/(\{\n)(\S)/, '$1  $2')
//       }
//     }
//   }).$mount()
//
//   console.error = function (error) {
//     throw new Error(error)
//   }
//   // wm.$mount()
//   setTimeout(end, 250)
// })
