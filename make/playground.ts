import { MakeThing, Store } from '../packages/store/src'
import { changeFx, qubit, stored } from '../packages/store/src/decor'

class X {
  @qubit
  name: string

  @stored age: number
}
const classStore = MakeThing(X).domain('x').register()

const cms = MakeThing(X).domain('z').multiRegister()
