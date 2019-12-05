import { test } from './ouput.shema'
import { ISens, La, LaSens, qubit } from '../src/core'
import { getter } from '../src/core/decor'

const xxx = () => 'hello'
export class BaseModule {
  @getter(xxx) word: string
  name = ''

  actions({ f, q }: La<BaseModule>) {
    return {
      say() {
        // f.word()
        // console.log('→D', f.word.value)
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
  console.log(store.state.base.name)
  ok(store.state.base.name == '', 'name is clear')
  end()
})
