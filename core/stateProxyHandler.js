'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.stateModuleProxy = module =>
  new Proxy(module, {
    get(o, key) {
      let v = o[key]
      if (v) return v.value
      else throw 'empty flow ' + key.toString() + ' for pure state getter'
    },
  })
exports.stateProxyHandler = () => {
  const cached = {}
  return {
    get(o, key) {
      if (cached[key]) {
        return cached[key]
      } else {
        return (cached[key] = exports.stateModuleProxy(o[key]))
      }
    },
  }
}
