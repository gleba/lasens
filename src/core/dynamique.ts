import { FromClass, ISens, LaAction } from './core'
import { A, AFlow } from 'alak'

import { DEBUG_DYN_MODULE, DEBUG_FACADE, primitiveExceptions } from './utils'
import { alwaysErrorProxy, proxyLoggerDynamique, proxyLoggerFlow } from './debugHandlers'
import { diamondMoment, wakeUp } from './decor'
import { stateModuleProxy } from './stateProxyHandler'

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
    const instance = new moduleClass()
    const [safeModule, arousal] = diamondMoment(moduleClass, id)
    wakeUp(arousal)

    let actions
    if (instance.actions) {
      let ctxPath = [id, instance.constructor.name, ...DEBUG_DYN_MODULE]
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

      // let q = stateModuleProxy(safeModule)
      actions = instance.actions(Object.assign({ f }, context))
      actions.id = id
      if (actions.new) {
        actions.new(argument)
      }
    }
    return false
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
            let flowWay = m[way]
            if (flowWay) {
              let flowKey = flowWay[key]
              if (flowKey) {
                return flowKey(...args)
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
