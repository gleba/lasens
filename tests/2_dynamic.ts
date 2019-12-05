import { test } from './ouput.shema'

import { Dynamique, IDynamique, La, LaSens, qubit } from '../src/core'
import { ISens } from '../src/core'

class BaseModule {
  @qubit userId: number
  a1 = 'wait'

  actions({ f, actions, dynamique }: La<BaseModule> & XStore) {
    // const f = flows.base
    // console.log({dynamique}, dynamique.BaseModule.removeById)
    // f.a1("?")

    f.userId.up(v => {
      actions.base.hello(v)
      dynamique.BaseModule.broadcast.actions.hello(v)
    })
    let id
    // console.log(f.a1)

    return {
      new(target) {
        id = target
        console.log(this.id)
      },
      hello(who) {
        console.log(who, id)
        f.userId(1)
      },
      generateUserId() {
        f.userId(Math.floor(Math.random() * 999999 + 100))
      },
    }
  }
}

const modules = {
  base: BaseModule,
}

const dynModules = { BaseModule }

export type XStore = IDynamique<typeof modules, typeof dynModules>

test('Dynamique', async ({ ok, end, fall, plan }) => {
  let store = Dynamique(LaSens(modules), dynModules)
  store.renew()
  let m1 = store.dynamique.BaseModule.create('m1')
  let m2 = store.dynamique.BaseModule('m2')
  let m3 = store.dynamique.BaseModule('m3')

  store.dynamique.BaseModule.broadcast.actions.generateUserId()

  setTimeout(end, 250)
})
