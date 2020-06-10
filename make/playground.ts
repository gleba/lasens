import { LasDomain, MakeThing, Sens } from '../packages/sens/src'
import { changeFx, qubit, stored } from '../packages/sens/src/decor'

class Store extends Sens<Store> {
  // name: string
  count = 1

  // yes = 1

  @stored age: number

  _private = {
    mem: 5,
  }
  _holistic = {
    ok: 1,
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
    console.log('## work ##')
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

class Private extends Store {
  secret = true
}

const cms = MakeThing(Store)
  .privateAtoms(Private)
  .publicActions(
    class extends Store {
      publicLevel() {

      }
    }
  )
  .constructor(body => {
    return {
      nextLevel() {
        // body.publicLevel()
        console.log('next level', body.secret.value)
      },
    }
  })
  .register()
cms.age(5)
cms.publicLevel()
cms.nextLevel()
cms.workMethod()
console.log(':')
// console.log({ cms })
