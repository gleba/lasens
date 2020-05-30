import { MakeThing, Store } from '../packages/sens/src'
import { changeFx, qubit, stored } from '../packages/sens/src/decor'

class X extends Store<X> {
  // name: string
  // count = 1

  yes = 1

  @stored age: number

  _start($: ThinkOf<X>, link) {
    // console.log('_start', { $ })
    // console.log('yes.value', $.yes.value)
    // $.age(5)
    this.age = 5

    // console.log(this.$.yes.value)
  }
  ok() {
    console.log('ok')
    return 0
  }
}
// const classStore = MakeThing(X).domain('x').register()
const cms = MakeThing(X).domain('z').register()
// let cms: XT<X>

cms.ok()
