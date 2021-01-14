import { MakeThing, Sens } from '../packages/sens/src'
import { stored, sync } from '../packages/sens/src/decor'
import { setCustomStorage } from '../packages/sens/src/storage'

// setCustomStorage({
//   init(atom: IAtom<any>): {
//
//     // return new Promise(done=>done(""))
//   },
//   clear() {},
// })

class Store extends Sens<Store> {
  // name: string

  count = 1

  // yes = 1

  // _private = {
  //   mem: 5,
  // }
  _ = {
    holy: 'stick'
  }

  //
  workMethod() {
    // this.age = 3
    console.log('## work ##')
    // console.log(":", this.)
    console.log('#', this.$.count.value)
    // this.$ns
    return 0
  }

  // get okg(){
  //   // console.log("--get-|",this.yes +"|")
  //   return "-"
  // }
}

// const classStore = MakeThing(X).domain('x').register()

class Private extends Sens<Private> {
  secret = true
  age: number
}

const cms = MakeThing(Store)
  // .privateAtoms(Private)
  // .publicActions(
  //   class extends Private {
  //     publicLevel() {
  //       this.age = 5
  //       console.log('public action age', this.age)
  //       console.log('public age.uid:::', this.$.age.uid)
  //       console.log('public age.uid:::', this.$.age.id)
  //       console.log('public action secret', this.secret)
  //       // console.log('public action count', this.count)
  //     }
  //   }
  // )
  .constructor(body => {
    // console.log(body.count.id)

    // body
    // console.log('body holy:::', body._)
    // console.log('body count:::', body.age.value)
    // console.log('body count:::', body.count.value)
    // console.log('body  .age.uid:::', body.age.uid)
    // console.log('body:', body.age.id, body.age.uid)

    // body.publicLevel()
    // body.age.up(v => {
    //   console.log('body up age', v)
    // })

    // console.log('awaiting')
    // new Promise(done => {
    //   setTimeout(done, 500)
    // })
    // console.log('ready')
    return {
      nextLevel(text: string) {
        console.log("!")

        // body.publicLevel()
        console.log('::next level 1::', body['x1'].uid)
        console.log('::next level 2::', body['x2'].uid)
        // console.log('next level', body.secret.value)
      }
    }
  })
  // .lifeCycle({
  //   immediatelyStart: true
  // })
  // .domain('cms')
  .multiRegister()


async function test() {
  // console.log(':::', cms(1))
  // let inst = cms(1)
  // console.log({ inst })
  // console.log(cms(1).count)
  console.log("::: :::2", cms(1)['x2'].uid)
  cms(1).nextLevel("a")
  console.log("::: :::1", cms(1)['x1'].uid)
  //
  // console.log('::: :::', inst.nextLevel("z"))

  // console.log('+')
  // console.log('::: :::', inst['x1'].uid)
  // console.log(':', inst.nextLevel('x'))
  // console.log()
  //
  // console.log(cms(1))
  console.log('________________________________________________________')

  // console.log(':1')
  // cms.publicLevel()
  // cms.solid(2)
  // // console.log({ p })
  // let x = await p
  // console.log('test 2')
  // x.nextLevel('yes')
  // console.log('test 3')
  // cms.broadcast.publicLevel()
  // cms.broadcast.publicLevel()
}

test()

// console.log('2 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: 1')

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
