import {holistic, LaSens, qubit} from "../src/core";
import {ISens} from "../src/core";
import {La} from "../src/core";
import {LaVue} from "../src/vue";
export class BaseModule {
  @qubit userId: number
  @holistic profile
  @holistic followers
  @holistic tweets

  a1 = "wait1"
  a2 = "wait2"
  a3 = "wait3"

  actions({f}: La<BaseModule>) {

    // f.userId.up(id => {
    //   f.profile(apiMockGetTo('/profile', id))
    //   f.followers(apiMockGetTo('/followers', id))
    //   f.tweets(apiMockGetTo('/tweets', id))
    // })

    return {
      generateUserId() {
        // f.userId(Math.floor(Math.random() * 999999 + 100))
        // this.a1("done")
      },
      a1(v) {
        // f.a1(v)
      },
      async action2() {
        // return new Promise(done => setTimeout(v => done(true), 200))
      }
    }
  }
}

const modules = {
  base: BaseModule,
  basez: BaseModule,
}

type XStore = ISens<typeof modules>


require('jsdom-global')()
var testUtils = require('@vue/test-utils'), Vue = require('vue');
const MyComponent = {
  template: `
    <div>
      {{ $flow.basde.a1.v }}
<!--      {{ $flow.base.a1.v }}-->
    </div>
  `
}

let store = LaSens(modules)
store.renew()
const laVue = LaVue(store)
const localVue = testUtils.createLocalVue()
localVue.use(laVue)
const wrapper = testUtils.mount(MyComponent, {localVue})
console.log(wrapper.html())
wrapper.destroy()
