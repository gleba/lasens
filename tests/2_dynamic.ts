import {test} from './ouput.shema'
// import {holistic, LaSens, LaSensType, qubit} from "../dist";
import {Dynamique, IDynamique} from "../src/dynamique";
import {LaSens, qubit} from "../src";
import {ISens} from "../src/core";


class BaseModule {
  @qubit userId: number
  a1 = "wait"

  actions({flows, actions, dynamique}: XStore) {
    const f = flows.base
    console.log({dynamique}, dynamique.BaseModule.removeById)

    return {
      new(target) {

      },
      generateUserId() {
        console.log("generateUserId")
        f.userId(Math.floor(Math.random() * 999999 + 100))
      }
    }
  }
}


const modules = {
  base: BaseModule,
}

const dynModules = {BaseModule}

export type XStore = IDynamique<typeof modules, typeof dynModules>

test('init store', async ({ok, end, fall, plan}) => {
  let store = Dynamique(LaSens(modules), dynModules)
  store.renew()
  let m1 = store.dynamique.BaseModule("m1")
  let m2 = store.dynamique.BaseModule("m2")
  let m3 = store.dynamique.BaseModule("m3")

  store.dynamique.BaseModule.broadcast.actions.generateUserId()
  setTimeout(end, 250)
})

