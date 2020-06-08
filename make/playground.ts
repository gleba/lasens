import { LasDomain, MakeThing, Sens } from '../packages/sens/src'
import { changeFx, qubit, stored } from '../packages/sens/src/decor'

class X extends Sens<X> {
  // name: string
  // count = 1

  yes = 1

  @stored age: number

  _private =  {
    mem:5
  }
  _holistic = {
    ok:1
  }
  _start({ $, _, holistic }: LinkedThinkOf<X, LasDomain>) {
    $.age.up(x=>{
      console.log("::",_.mem )
    })

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
const classStore = MakeThing(X).domain('x').register()
const cms = MakeThing(X).register()
// let cms: XT<X>
console.log("sub")

// cms.onNewRegistration(x=>{
//   console.log("id", x.$id)
// })
//
cms.age(1)
console.log(":")
console.log({cms})

