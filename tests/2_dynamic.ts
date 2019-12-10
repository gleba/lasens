import { test } from './ouput.shema'

import { Dynamique, IDynamique, La, LaSens, qubit } from '../src/core'
import { ISens } from '../src/core'
import { Do } from '../src/core/dynamique'
import A from 'alak'

class BaseModule {
  @qubit userId: string
  world = 'hello'

  actions({ f, actions, flows, dynamique, free }: Do<BaseModule, XStore>) {
    // const f = flows.base
    // console.log(Object.keys(a))
    // f.a1("?")
    // console.log("actions call ←←")

    f.userId.up(id => {
      // actions.base.hello(id)
      // console.log("userId is", )
      // actions.base.hello(v)
      dynamique.BaseModule.broadcast.actions.hello(id)
    })

    let id

    setInterval(() => {
      f.userId(Math.random() + 'x')
    }, 100)

    return {
      new(target) {
        id = this.id
        // f.userId('user_' + this.generateUserId() + '_' + this.id)
        f.world.from(flows.base.userId).quantum(x => {
          console.log(id, x)
          return x
        })
        setTimeout(() => free, 200)
      },
      hello(word) {
        console.log('hello from', word, 'to', id)
      },
      generateUserId() {
        return Math.floor(Math.random() * 999999 + 100)
      },
    }
  }
}

const modules = {
  base: BaseModule,
}

const dynModules = { BaseModule }

export type XStore = IDynamique<typeof modules, typeof dynModules>

const x = A()

test('Dynamique', async ({ ok, end, fall, plan }) => {
  let store = Dynamique(LaSens(modules), dynModules)
  store.renew()

  // store.flows

  // let m1 = store.dynamique.BaseModule.create('m1')
  // let m2 = store.dynamique.BaseModule('m2')
  // let m3 = store.dynamique.BaseModule('m3')

  store.dynamique.BaseModule('m1')
  store.dynamique.BaseModule('m2')
  store.dynamique.BaseModule('m3')
  store.dynamique.BaseModule('m4')
  // // store.dynamique.BaseModule('m3').actions.hello("x")
  store.dynamique.BaseModule('m5')
  store.dynamique.BaseModule('m6')
  store.dynamique.BaseModule('m7')

  // console.log(store.state.base.world)

  // store.dynamique.BaseModule.broadcast.actions.generateUserId()

  setTimeout(end, 250)
})
