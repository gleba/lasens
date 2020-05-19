import { Dynamique, LaSens } from '../packages/core'
import { IDynamique, ISens } from '../packages/core'
import { Do } from '../packages/core/dynamique'

class SessionController {
  score = 0
  actions({ a, q, dynamique, id }: Do<SessionController, IStore>) {
    dynamique.SessionController.broadcast.actions.hi(id)
    return {
      hi(fromId) {
        console.log(`im a ${id}, got hi from ${fromId}, an my score:${q.score}`)
        a.score(q.score + 1)
      },
      goodbye() {
        dynamique.SessionController.removeById(id)
      },
    }
  }
}

const dynamiqueModules = { SessionController }
type IStore = IDynamique<any, typeof dynamiqueModules>
const store = Dynamique(LaSens({}), dynamiqueModules).renew()

let i = 3

while (i--) store.dynamique.SessionController(i + 100)

store.dynamique.SessionController.broadcast.actions.hi('root')
store.dynamique.SessionController.broadcast.actions.goodbye()
store.dynamique.SessionController.broadcast.actions.hi('end')
console.log('?')
