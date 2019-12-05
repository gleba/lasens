'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const alak_1 = require('alak')
const utils_1 = require('./utils')
const debugHandlers_1 = require('./debugHandlers')
const decor_1 = require('./decor')
const stateProxyHandler_1 = require('./stateProxyHandler')
function Dynamique(store, modules) {
  const satMap = (store['satelliteMap'] = new Map())
  function moduleOperations(moduleClass) {
    const instancesMap = satMap.has(moduleClass) ? satMap.get(moduleClass) : new Map()
    function create(argument) {
      let id
      let uid = Math.random()
      if (argument) {
        switch (typeof argument) {
          case 'string':
          case 'number':
          case 'symbol':
          case 'bigint':
            id = argument
            break
          default:
            if (argument.id) id = argument.id
        }
      }
      if (!id) id = uid
      if (instancesMap.has(id)) return instancesMap.get(id)
      const instance = new moduleClass()
      const [safeModule, arousal] = decor_1.diamondMoment(instance, id)
      decor_1.wakeUp(arousal)
      let actions
      if (instance.actions) {
        let contextDebug = [id, instance.constructor.name, ...utils_1.DEBUG_DYN_MODULE]
        let context = store.newContext(contextDebug)
        let f
        if (alak_1.A.canLog) {
          let p = new Proxy({ x: safeModule }, debugHandlers_1.proxyLoggerFlow(contextDebug))
          f = p.x
        } else {
          f = safeModule
        }
        let q = stateProxyHandler_1.stateModuleProxy(safeModule)
        context = Object.assign({ f, q, id }, context)
        actions = instance.actions.apply(context, [context, context])
        actions.id = id
        if (actions.new) {
          actions.new(argument)
        }
      }
      return {
        flows: safeModule,
        actions,
      }
      instancesMap.set(id, safeModule)
      satMap.set(moduleClass, instancesMap)
      safeModule['id'] = id
      return module
    }
    const broadcastHandler = {
      get({ way }, key) {
        return (...args) =>
          instancesMap.forEach(m => {
            let castWay = m[way]
            if (castWay) {
              let flowKey = castWay[key]
              if (flowKey) {
                return flowKey(...args)
              }
            }
          })
      },
    }
    return Object.assign(create, {
      broadcast: {
        flows: new Proxy({ way: 'flows' }, broadcastHandler),
        actions: new Proxy({ way: 'actions' }, broadcastHandler),
      },
      create,
      getById: id => (instancesMap.has(id) ? instancesMap.get(id) : undefined),
      removeById: id => (instancesMap.has(id) ? instancesMap.delete(id) : undefined),
    })
  }
  const dynamique = new Proxy(modules, {
    get(o, key) {
      let m = o[key]
      if (m) return moduleOperations(m)
      else throw 'Dynamique module ' + key.toString() + ' not present'
    },
  })
  store['things'].dynamique = [dynamique, debugHandlers_1.proxyLoggerDynamique]
  store['dynamique'] = alak_1.A.canLog
    ? new Proxy(dynamique, debugHandlers_1.proxyLoggerDynamique(utils_1.DEBUG_FACADE))
    : dynamique
  return store
}
exports.Dynamique = Dynamique
