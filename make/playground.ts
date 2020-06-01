import { Domain, MakeThing, Store } from '../packages/sens/src'
import { changeFx, qubit, stored } from '../packages/sens/src/decor'

class X extends Store<X> {
  // name: string
  // count = 1

  yes = 1

  @stored age: number

  _private =  {
    mem:5
  }
  _start({ _, $ }: LinkedThinkOf<X, Domain>) {
    $.age(_.mem.value)
  }

  ok() {
    console.log('ok', this.age)
    return 0
  }
}
// const classStore = MakeThing(X).domain('x').register()
const cms = MakeThing(X).domain('x').register()
// let cms: XT<X>
cms.ok()

console.log(cms.age.value)

