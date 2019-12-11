'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const alak_1 = require('alak')
const decor_1 = require('./decor')
const utils_1 = require('./utils')
const debugHandlers_1 = require('./debugHandlers')
const stateProxyHandler_1 = require('./stateProxyHandler')
// export const META_HOLISTIC = 'holistic'
exports.META_MODULE_PATH = 'module_path'
exports.META_CLASS = 'class'
function LaSens(modules) {
  const availableModules = () => 'available modules: ' + Object.keys(sleepingModules).toString()
  const sleepingModules = {}
  let awakedFlow = {}
  let awakedActions = {}
  let flowMap = {}
  let usedWays = {}
  let storeId = 0
  const graphProxyHandler = {
    get(o, key) {
      let m = o[key]
      if (!m) {
        let reasonToSleep = wakeUpModule(key)
        if (!reasonToSleep) {
          m = o[key]
        } else if (utils_1.primitiveExceptions[key]) {
          return reasonToSleep
        } else {
          let reasonExplain =
            '[' + key + '] is unavailable module, available path: ' + reasonToSleep.toString()
          return alak_1.default.canLog
            ? reasonExplain
            : debugHandlers_1.alwaysErrorProxy(reasonExplain)
        }
      }
      return m
    },
  }
  const flows = new Proxy(awakedFlow, graphProxyHandler)
  const actions = new Proxy(awakedActions, graphProxyHandler)
  const state = new Proxy(flows, stateProxyHandler_1.stateProxyHandler())
  const things = {
    flows: [flows, debugHandlers_1.proxyLoggerFlow],
    actions: [actions, debugHandlers_1.proxyLoggerAction],
    state: [state],
  }
  function makeSenseFor(context) {
    let result = {}
    Object.keys(things).forEach(k => {
      let [thing, proxyH] = things[k]
      if (alak_1.default.canLog) {
        result[k] = new Proxy(thing, proxyH(context))
      } else {
        result[k] = thing
      }
    })
    return result
  }
  // const state = new Proxy(awakedActions, graphProxyHandler) as ActionsFromClassKeysIn<T>
  function wakeUpModule(modulePath) {
    if (utils_1.primitiveExceptions[modulePath]) {
      return debugHandlers_1.alwaysErrorProxy(availableModules())
    }
    let sleepingModule = sleepingModules[modulePath]
    if (!sleepingModule) {
      console.error('Module by path name: [', modulePath, '] is not found')
      let availableModulesMessage = availableModules()
      console.warn(availableModulesMessage)
      return debugHandlers_1.alwaysErrorProxy(availableModulesMessage)
    }
    const instance = new sleepingModule()
    const [safeModule, arousal] = decor_1.diamondMoment(instance, modulePath)
    awakedFlow[modulePath] = safeModule
    decor_1.wakeUp(arousal)
    console.log('✓ awake module :', modulePath)
    if (instance.actions) {
      let context = makeSenseFor([instance.constructor, modulePath, ...utils_1.DEBUG_MODULE])
      const f = context.flows[modulePath]
      const q = context.state[modulePath]
      context = Object.assign(context, { f, q })
      awakedActions[modulePath] = instance.actions.apply(context, [context, context])
    }
    return false
  }
  function renew() {
    utils_1.clearObject(awakedActions)
    utils_1.clearObject(awakedFlow)
    utils_1.clearObject(usedWays)
    utils_1.clearObject(sleepingModules)
    storeId++
    for (let moduleName in modules) {
      sleepingModules[moduleName] = modules[moduleName]
    }
  }
  return Object.assign(
    { renew, things, newContext: makeSenseFor },
    makeSenseFor(utils_1.DEBUG_FACADE),
  )
}
exports.LaSens = LaSens
