import { LasDomain, MakeThing, Sens } from '../packages/sens/src'
import { changeFx, qubit, stored } from '../packages/sens/src/decor'

class Store extends Sens<Store> {
  // name: string
  count = 1

  // yes = 1

  @stored age: number

  _private =  {
    mem:5
  }
  _holistic = {
    ok:1
  }
  _start(ln: LinkedThinkOf<Store, LasDomain>) {
    // console.log(ln.$.count)

    // $.age.up(x=>{
    //   console.log("::",_.mem )
    // })
  }
  //
  workMethod() {
    // this.age = 3
    console.log("## work ##")
    // console.log(":", this.)
    // console.log("#", this.$.count.value)
    return 0
  }

  // get okg(){
  //   // console.log("--get-|",this.yes +"|")
  //   return "-"
  // }
}
// const classStore = MakeThing(X).domain('x').register()

class Private {
  secret = true
}
const cms = MakeThing(Store)
  .privateAtoms(Private)
  .publicActions({
    ok(){
      this.count
    }
  })
// cms.age(5)
// console.log(":")
// cms.workMethod()

console.log({ cms })

