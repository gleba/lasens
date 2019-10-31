import A from "alak";

let isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

let isServer = !isBrowser()

export const XStorage = {
  bindFlow(flow) {
    if (isServer) return false
    let v = localStorage.getItem(flow.id)
    if (v && v != 'undefined') {
      let vv = JSON.parse(v)
      flow(vv)
      flow.next(v =>
        localStorage.setItem(flow.id, JSON.stringify(v))
      )
    }
    flow.on(A.STATE_CLEAR_VALUE, () => {
      localStorage.removeItem((flow.id))
    })
    flow.up(v =>
      localStorage.setItem(flow.id, JSON.stringify(v))
    )
  },
  // save(flow) {
  //   if (isServer) return false
  //   else return localStorage.setItem(flow.id, JSON.stringify(flow.value))
  // },
  // setItem(key, item) {
  //   if (isServer) return false
  //   else return localStorage.setItem(key, JSON.stringify(item))
  // },
  //
  // getItem(key): any {
  //   if (isServer) return
  //   let v = localStorage.getItem(key)
  //   if (v) {
  //     return JSON.parse(v)
  //   }
  //   return null
  // },
  //
  // restoreState(key, state): any {
  //   if (isServer) return
  //   let v = localStorage.getItem(key)
  //   if (v && v != 'undefined') {
  //     state[key] = JSON.parse(v)
  //   }
  // },
  // restoreFlow(flow): any {
  //   if (isServer) return
  //   let v = localStorage.getItem(flow.id)
  //   if (v && v != 'undefined') {
  //     let observe = flow.isMeta("observe")
  //     let vv = JSON.parse(v)
  //     flow(vv)
  //   }
  // },
  clear() {
    if (isServer) return
    localStorage.clear()
  }
}
