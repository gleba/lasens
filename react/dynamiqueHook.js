'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const alak_1 = require('alak')
const core_1 = require('../core/core')
function makeDqFlowsProxyHandler() {
  const cache = {}
  const activeMap = {}
  const setActive = (flow, v) => {
    let modulePath = flow.getMeta(core_1.META_MODULE_PATH)
    if (!activeMap[modulePath]) {
      activeMap[modulePath] = { [flow.name]: v }
    } else {
      activeMap[modulePath][flow.name] = v
    }
  }
  const timeoutMap = {}
  function clearUsage(flow, clearFn) {
    let modulePath = flow.getMeta(core_1.META_MODULE_PATH)
    if (timeoutMap[modulePath]) return
    const checkFn = () => {
      let o = activeMap[modulePath]
      return Object.keys(o).every(k => !o[k])
    }
    if (checkFn()) {
      timeoutMap[modulePath] && clearTimeout(timeoutMap[modulePath])
      timeoutMap[modulePath] = setTimeout(() => {
        if (checkFn()) {
          delete cache[flow.name]
          delete activeMap[modulePath]
          clearFn()
        }
      }, 5000)
    }
  }
  function makeFlow(dqModule, flowName) {
    let connectedTarget
    let proxyFlow = cache[flowName]
    if (!proxyFlow) {
      proxyFlow = cache[flowName] = alak_1.default()
      proxyFlow.up(v => {
        if (connectedTarget && connectedTarget.value != v) {
          connectedTarget(v)
        }
      })
    }
    return function(argForD) {
      let dqm = dqModule(argForD)
      let target = dqm.flows[flowName]
      // setActive(target, true)
      if (connectedTarget && connectedTarget.id != target.id) {
        connectedTarget.down(proxyFlow)
        // setActive(connectedTarget, false)
        // clearUsage(connectedTarget, dqm.free)
      }
      connectedTarget = target
      if (proxyFlow.id != target.id) target.up(proxyFlow)
      proxyFlow.setId(target.id)
      return proxyFlow
    }
  }
  return {
    get(dqModule, flowName) {
      let f = cache[flowName]
      if (!f) f = cache[flowName] = makeFlow(dqModule, flowName)
      return f
    },
  }
}
function dynamiqueHooksConnector(store) {
  const dProxyHandler = {
    get(cache, className) {
      let m = cache[className]
      if (!m)
        m = cache[className] = new Proxy(store.dynamique[className], makeDqFlowsProxyHandler())
      return m
    },
  }
  return new Proxy({}, dProxyHandler)
}
exports.dynamiqueHooksConnector = dynamiqueHooksConnector
