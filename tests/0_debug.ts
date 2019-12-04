import { test } from './ouput.shema'
import { ISens, La, LaSens, qubit } from '../src/core'

export class BaseModule {
  @qubit word: string

  actions({ f, q }: La<BaseModule>) {
    return {
      say() {
        f.word('hello')
      },
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
  store.actions.base.say()
  ok(store.state.base.word == 'hello', 'word is hello')
  end()
})
