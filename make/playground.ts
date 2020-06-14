import { NS, MakeThing, setCustomStorage, Sens } from '../packages/sens/src'
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

  // _private = {
  //   mem: 5,
  // }
  _ = {
    holy: 'stick',
  }

  //
  workMethod() {
    // this.age = 3
    console.log('## work ##')
    // console.log(":", this.)
    console.log('#', this.$.count.value)
    this.$ns
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
  @stored age: number
}

const cms = MakeThing(Store)
  .privateAtoms(Private)
  // .publicActions(
  //   class extends Private {
  //     publicLevel() {
  //       this.age = 5
  //       console.log('public action age', this.age)
  //       console.log('public age.uid:::', this.$.age.uid)
  //       console.log('public action secret', this.secret)
  //       // console.log('public action count', this.count)
  //     }
  //   }
  // )
  .constructor(body => {
    // body
    // console.log('body holy:::', body._)
    // console.log('body count:::', body.age.value)
    // console.log('body count:::', body.count.value)
    // console.log('body  .age.uid:::', body.age.uid)
    console.log('body:', body.age.id, body.age.uid)

    // body.age.up(v => {
    //   console.log('body up age', v)
    // })

    return {
      nextLevel() {
        // body.publicLevel()
        console.log('next level', body.secret.value)
      },
    }
  })
  .lifeCycle({
    immediatelyStart: true,
  })
  .domain('cms')
  .register()

// declare module '../packages/sens/src' {
//   export interface NS {
//     cmzs: typeof cms
//   }
// }

// console.log(':::', cms.age.uid)
// cms.age(5)

// cms(34).publicLevel()
// const i =  cms(34)
// cms.age.up(x => {
//   console.log('grow up', x)
// })
// cms.count(2)
// cms.publicLevel()
//
// cms.nextLevel()
// cms.workMethod()

// console.log(':', cms)
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

// interface Todo {
//   title: string
//   description: string
//   completed: boolean
// }
//
// const todo: NS //RmType<NS, Thing<Store>>
//
// todo
