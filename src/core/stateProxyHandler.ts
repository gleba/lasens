export const stateModuleProxy = module =>
  new Proxy(module, {
    get(o, key) {
      let v = o[key]
      if (v) return v.value
      else throw 'empty flow ' + key.toString() + ' for pure state getter'
    },
  })

export const stateProxyHandler = () => {
  const cached = {}
  return {
    get(o, key) {
      if (cached[key]) {
        return cached[key]
      } else {
        return (cached[key] = stateModuleProxy(o[key]))
      }
    },
  }
}
