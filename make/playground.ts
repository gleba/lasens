import { MakeThing, Store } from '../packages/store/src'
import { changeFx, qubit, stored } from '../packages/store/src/decor'

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
}
// const classStore = MakeThing(X).domain('x').register()

// const cms = MakeThing(X).domain('z').multiRegister()
const cms = MakeThing(X).domain('z').multiRegister()
// console.log({ cms })

console.log('age', cms(2).age)
