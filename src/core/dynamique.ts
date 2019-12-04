import { FromClass, ISens, LaAction, META_CLASSNAME, META_HOLISTIC } from './core'
import { A, AFlow } from 'alak'
import { applyDecors, holisticLive, wakeUp } from './decor'
import { alive, DEBUG_DYN_MODULE, DEBUG_FACADE, DEBUG_INIT_FLOW } from './utils'
import { proxyLoggerDynamique, proxyLoggerFlow, safeModulePathHandler } from './debugHandlers'

type StateModule<T> = Omit<T, 'actions'>
type FlowModule<T> = { readonly [K in keyof T]: AFlow<T[K]> }
declare type QuickModule<T> = {
  readonly [K in keyof T]: T[K]
}

export interface La<T> {
  f: FlowModule<StateModule<T>>
  q: QuickModule<StateModule<T>>
}
type DynamiqueModule<T> = {
  actions: LaAction<T>
  flow: FlowModule<StateModule<T>>
}

type DynamiqueModules<T> = {
  [K in keyof T]: {
    (target?: any): DynamiqueModule<FromClass<T[K]>>
    broadcast: DynamiqueModule<FromClass<T[K]>>
    create(o?: any): DynamiqueModule<FromClass<T[K]>>
    getById(id: string | number): DynamiqueModule<FromClass<T[K]>>
    removeById(id: string | number): void
  }
}

export interface IDynamique<U, T> extends ISens<U> {
  dynamique: DynamiqueModules<T>
}

export function Dynamique<U, T>(store: ISens<U>, modules: T): IDynamique<U, T> {
  function create(moduleClass, id, argument) {
    let instance = new moduleClass()
    let className = instance.constructor.name
    let holistic = holisticLive(instance, className)
    let module = new Proxy({ _: { moduleName: instance, className } }, safeModulePathHandler)
    Object.keys(instance).forEach(flowName => {
      let flow = A.flow()
      let initialFlowStateValue = instance[flowName]
      let isHolistic = holistic[flowName]
      let isAliveValue = alive(initialFlowStateValue)
      if (isHolistic) {
        flow.addMeta(META_HOLISTIC, initialFlowStateValue)
      }
      flow.setId(className + '.' + id + '.' + flowName)
      flow.addMeta(META_CLASSNAME, className)
      if (isAliveValue && !isHolistic) {
        flow(initialFlowStateValue, DEBUG_INIT_FLOW)
      }
      applyDecors(flow, className, flowName)
      module[flowName] = flow
    })
    wakeUp()
    let actions
    if (instance.actions) {
      let ctxPath = [id, className, ...DEBUG_DYN_MODULE]
      let ctxedThinx = store.newContext(ctxPath)
      let f
      if (A.canLog) {
        let p = new Proxy({ x: module }, proxyLoggerFlow(ctxPath))
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

  const dynamique = new Proxy(modules as any, {
    get(o, key) {
      let m = o[key]
      if (m) return moduleOperations(m)
      else throw 'Dynamique module ' + key.toString() + ' not present'
    },
  })

  store['things'].dynamique = [dynamique, proxyLoggerDynamique]
  store['dynamique'] = A.canLog
    ? new Proxy(dynamique, proxyLoggerDynamique(DEBUG_FACADE))
    : dynamique
  return store as any
}
