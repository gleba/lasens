import { test } from './ouput.shema'

// import { holistic, qubit } from '../src/decor'
import set = Reflect.set
import {holistic, LaSens, qubit} from "../src";
import {ISens} from "../src/core";
import {La} from "../src/dynamique";


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

  a1 = "wait"

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

export type XStore = ISens<typeof modules>

test('init store', async ({ ok, end, fall, plan }) => {
  let store = LaSens(modules)
  store.renew()
  //
  ok(store.flows.base.a1.value=='wait', "action1 wait")
  store.flows.base.userId.up(id => {
    ok(id>100, "userId")
    store.flows.base.profile.once(p=> ok(p.id == id, "profile"))
    store.flows.base.followers.once(v=> ok(v.length, "followers"))
    store.flows.base.tweets.once(v=> ok(v.length, "tweets"))
  })
  store.actions.base.generateUserId()
  ok(store.flows.base.a1.value=='done', "action1 done")
  ok(await store.actions.base.action2(), "action2 async getter")

  setTimeout(end, 250)
})
