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
    $.age.up(x=>{
      console.log("::",x)
    })
    $.age(_.mem.value)
  }
  //
  ok() {
    console.log('ok')
    return 0
  }

  get okg(){
    // console.log("--get-|",this.yes +"|")
    console.log( this._)
    return "-"
  }
}
// const classStore = MakeThing(X).domain('x').register()
const cms = MakeThing(X).domain('x').register()
// let cms: XT<X>
// cms.ok()


console.log(cms.okg)

