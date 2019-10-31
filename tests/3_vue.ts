import {holistic, LaSens, qubit} from "../src/core";
import {ISens} from "../src/core";
import {La} from "../src/core";
import {LaVue} from "../src/vue";


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
        let ar = Array(Math.round(1 + Math.random() * 7)).fill(0)
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

  actions({f}: La<BaseModule>) {

    f.userId.up(id => {
      f.profile(apiMockGetTo('/profile', id))
      f.followers(apiMockGetTo('/followers', id))
      f.tweets(apiMockGetTo('/tweets', id))
    })

    return {
      generateUserId() {
        f.userId(Math.floor(Math.random() * 999999 + 100))
        this.a1("done")
      },
      a1(v) {
        f.a1(v)
      },
      async action2() {
        return new Promise(done => setTimeout(v => done(true), 200))
      }
    }
  }
}

const modules = {
  base: BaseModule,
}

type XStore = ISens<typeof modules>


require('jsdom-global')()
var testUtils = require('@vue/test-utils'), Vue = require('vue');
const MyComponent = {
  template: `
    <div>
      {{ a2 ? a2 :" fall " }}
<!--      {{ xxx }}-->
<!--      <button @click="increment">Increment</button>-->
    </div>
  `,

  data() {
    console.log("data ✓!")
    return {
      count: 0
    }
  },

  from({base}) {
    // base.a2.as("xxx")
    base.a2.asIs(x=>x+"00")

    // base.a3.up(x=>{
    //   this.count = 3
    //   this.xxx = x+"xxx!"
    // })

  },
  methods: {
    increment() {
      this.count++
    }
  }
}

let store = LaSens(modules)
store.renew()
const laVue = LaVue(store)
const localVue = testUtils.createLocalVue()
localVue.use(laVue)
const wrapper = testUtils.mount(MyComponent, {localVue})
store.flows.base.a3("new")
console.log(wrapper.html())
wrapper.destroy()
