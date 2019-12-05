'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const core_1 = require('./core')
const alak_1 = require('alak')
const decor_1 = require('./decor')
const utils_1 = require('./utils')
const debugHandlers_1 = require('./debugHandlers')
function Dynamique(store, modules) {
  function create(moduleClass, id, argument) {
    let instance = new moduleClass()
    let className = instance.constructor.name
    let holistic = decor_1.holisticLive(instance, className)
    let module = new Proxy(
      { _: { moduleName: instance, className } },
      debugHandlers_1.safeModulePathHandler,
    )
    Object.keys(instance).forEach(flowName => {
      let flow = alak_1.A.flow()
      let initialFlowStateValue = instance[flowName]
      let isHolistic = holistic[flowName]
      let isAliveValue = utils_1.alive(initialFlowStateValue)
      if (isHolistic) {
        flow.addMeta(core_1.META_HOLISTIC, initialFlowStateValue)
      }
      flow.setId(className + '.' + id + '.' + flowName)
      flow.addMeta(core_1.META_CLASSNAME, className)
      if (isAliveValue && !isHolistic) {
        flow(initialFlowStateValue, utils_1.DEBUG_INIT_FLOW)
      }
      decor_1.applyDecors(flow, className, flowName)
      module[flowName] = flow
    })
    decor_1.wakeUp()
    let actions
    if (instance.actions) {
      let ctxPath = [id, className, ...utils_1.DEBUG_DYN_MODULE]
      let ctxedThinx = store.newContext(ctxPath)
      let f
      if (alak_1.A.canLog) {
        let p = new Proxy({ x: module }, debugHandlers_1.proxyLoggerFlow(ctxPath))
        f = p.x
      } else {
        f = module
      }
      let context = Object.assign({ id }, ctxedThinx)
      instance.actions.bind(context)
      actions = instance.actions(Object.assign({ f }, context))
      actions.id = id
      if (actions.new) {
        actions.new(argument)
      }
    }
    return {
      flows: module,
      actions,
    }
  }
  const satMap = (store['satelliteMap'] = new Map())
  function moduleOperations(moduleClass) {
    let instancesMap = satMap.has(moduleClass) ? satMap.get(moduleClass) : new Map()
    function createFrom(argument) {
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
      const module = create(moduleClass, id, argument)
      instancesMap.set(id, module)
      satMap.set(moduleClass, instancesMap)
      module['id'] = id
      return module
    }
    const broadcastHandler = {
      get({ way }, key) {
        return (...args) =>
          instancesMap.forEach(m => {
            let fway = m[way]
            if (fway) {
              let fkey = fway[key]
              if (fkey) {
                return fkey(...args)
              }
            }
          })
      },
    }
    return Object.assign(createFrom, {
      broadcast: {
        flows: new Proxy({ way: 'flows' }, broadcastHandler),
        actions: new Proxy({ way: 'actions' }, broadcastHandler),
      },
      create: createFrom,
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
