import A from 'alak'

let isBrowser = new Function(
  'try {return this===window;}catch(e){ return false;}'
)
let isServer = !isBrowser()

type IStorage = {
  init(atom: IAtom<any>): void
  clear?(): void
}

const storage = {
  init(atom: IAtom<any>) {
    console.log('::store::', atom.id, atom.uid)
    if (isServer) return false
    let v = localStorage.getItem(atom.id)
    if (v && v != 'undefined') {
      let vv = JSON.parse(v)
      atom(vv)
      atom.next(v => localStorage.setItem(atom.id, JSON.stringify(v)))
    }
    atom.onClear(() => {
      localStorage.removeItem(atom.id)
    })
    atom.up(v => {
      localStorage.setItem(atom.id, JSON.stringify(v))
    })
  },

  clear() {
    if (isServer) return
    localStorage.clear()
  },
}

const current: any = {
  store: storage,
}
export function setCustomStorage(store: IStorage) {
  current.store = store
}

/**
 * @internal
 */
export const Storage = new Proxy(current, {
  get(target: { store: any }, key): any {
    return target.store[key]
  },
})
