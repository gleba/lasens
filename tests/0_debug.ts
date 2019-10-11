import { test } from './ouput.shema'
import {ISens, La, LaSens} from "../src/core";

export class BaseModule {

  word = "wait"

  actions({f}:La<BaseModule>) {
    return {
      async action2(){
        f.word("hello")
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
  store.actions.base.action2()
  end()
})

