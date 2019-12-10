'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const alak_1 = require('alak')
const utils_1 = require('./utils')
const debugHandlers_1 = require('./debugHandlers')
const decor_1 = require('./decor')
const stateProxyHandler_1 = require('./stateProxyHandler')
function Dynamique(store, modules) {
  const dynamiqueMap = new Map()
  function moduleOperations(moduleClass) {
    const instancesMap = dynamiqueMap.has(moduleClass) ? dynamiqueMap.get(moduleClass) : new Map()
    function create(target) {
      let id
      let uid = Math.random()
      if (target) {
        switch (typeof target) {
          case 'string':
          case 'number':
          case 'symbol':
          case 'bigint':
            id = target
            break
          default:
            if (target.id) id = target.id
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
        context = Object.assign({ f, q, id, target }, context)
        actions = instance.actions.apply(context, [context, context])
        actions.id = id
        // actions = {id, ...actions}
        // Object.keys(actions).forEach(f=>{
        //   f!="id" && actions[f].bind(actions)
        // })
        if (actions.new) {
          // actions.new(argument) //.apply(context, [argument])
          actions.new.apply(actions, [target])
        }
      }
      const dynamiqueModule = {
        flows: safeModule,
        actions,
        id,
        free: () => instancesMap.delete(id),
      }
      instancesMap.set(id, dynamiqueModule)
      dynamiqueMap.set(moduleClass, instancesMap)
      return dynamiqueModule
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
    const getById = id => (instancesMap.has(id) ? instancesMap.get(id) : undefined)
    return Object.assign(create, {
      broadcast: {
        flows: new Proxy({ way: 'flows' }, broadcastHandler),
        actions: new Proxy({ way: 'actions' }, broadcastHandler),
      },
      create,
      getById,
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
