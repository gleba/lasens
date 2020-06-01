import A from 'alak'

let isBrowser = new Function(
  'try {return this===window;}catch(e){ return false;}'
)

let isServer = !isBrowser()

export const XStorage = {
  init(atom: IAtom<any>) {
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
    atom.up(v => localStorage.setItem(atom.id, JSON.stringify(v)))
  },

  clear() {
    if (isServer) return
    localStorage.clear()
  },
}
