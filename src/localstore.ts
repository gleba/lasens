

let isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

let isServer = !isBrowser()

export const XStorage = {
  save(flow) {
    if (isServer) return false
    else return localStorage.setItem(flow.id, JSON.stringify(flow.value))
  },
  setItem(key, item) {
    if (isServer) return false
    else return localStorage.setItem(key, JSON.stringify(item))
  },

   getItem(key): any {
    if (isServer) return
    let v = localStorage.getItem(key)
    if (v) {
      return JSON.parse(v)
    }
    return null
  },

   restoreState(key, state): any {
    if (isServer) return
    let v = localStorage.getItem(key)
    if (v && v != 'undefined') {
      state[key] = JSON.parse(v)
    }
  },
   restoreFlow(id, flow): any {
    if (isServer) return
    let v = localStorage.getItem(id)
    if (v && v != 'undefined') {
      let observe = flow.isMeta("observe")
      let vv = JSON.parse(v)
      flow(vv)
    }
  },
  clear() {
    if (isServer) return
    localStorage.clear()
  }
}
