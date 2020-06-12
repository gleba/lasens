import {
  LasDomain,
  MakeThing,
  Sens,
  setCustomStorage,
} from '../packages/sens/src'
import { changeFx, qubit, stored } from '../packages/sens/src/decor'

setCustomStorage({
  init(atom: IAtom<any>): boolean {
    console.log(atom.id)
    return true
  },
  clear() {},
})

class Store extends Sens<Store> {
  // name: string
  count = 1

  // yes = 1

  @stored age: number

  _private = {
    mem: 5,
  }
  _ = {
    holy: 'stick',
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
      publicLevel() {}
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

console.log(':', cms._)
// console.log({ cms })

// class aliveModel extends Sens<aliveModel> {
//   stop: string
//   nope() {}
// }
//
// export const alive = MakeThing(aliveModel)
//   .constructor(a => {
//     return {
//       zzz(rune, xid) {
//         // console.log("-")
//         // return db.get(rune)
//       },
//     }
//   })
//   .register()
//
// a
