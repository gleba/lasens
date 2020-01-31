import {
  ActionFnResult,
  ClassKeysAsFlow,
  ExtractClass,
  FlowObject,
  ISens,
  La,
  LaSensType,
} from './core'
import { A, AFlow } from 'alak'

import { DEBUG_DYN_MODULE, DEBUG_FACADE } from './utils'
import { proxyLoggerDynamique, proxyLoggerFlow } from './debugHandlers'
import { diamondMoment, wakeUp } from './decor'

import { stateModuleProxy } from './stateProxyHandler'

type StateModule<T> = Omit<T, 'actions'>
type FlowModule<T> = { readonly [K in keyof T]: AFlow<T[K]> }

export type DynamiqueFromStore<T> = T extends { dynamique: any } ? T['dynamique'] : any

export interface Do<T, S> extends La<T, S> {
  id: string | number
  target: any
  free: void
  dynamique: DynamiqueFromStore<S>
}

export type LaAction<T> = T extends { actions: (...args: any) => any }
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any
type DynamiqueModule<T> = {
  actions: ActionFnResult<T>
  flows: FlowModule<StateModule<T>>
}

type DynamiqueModules<T> = {
  [K in keyof T]: {
    (target?: any): DynamiqueModule<ExtractClass<T[K]>>
    broadcast: DynamiqueModule<ExtractClass<T[K]>>
    create(o?: any): DynamiqueModule<ExtractClass<T[K]>>
    getById(id: string | number): DynamiqueModule<ExtractClass<T[K]>>
    removeById(id: string | number): void
  }
}

export interface IDynamique<U, T> extends ISens<U> {
  dynamique: DynamiqueModules<T>
}

export function Dynamique<U, T>(store: ISens<U>, modules: T): IDynamique<U, T> {
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
      const [safeModule, arousal] = diamondMoment(instance, id)
      wakeUp(arousal)

      let actions
      if (instance.actions) {
        let contextDebug = [id, instance.constructor.name, ...DEBUG_DYN_MODULE]
        let context = store.newContext(contextDebug)
        let f
        if (A.canLog) {
          let p = new Proxy({ x: safeModule }, proxyLoggerFlow(contextDebug))
          f = p.x
        } else {
          f = safeModule
        }

        let q = stateModuleProxy(safeModule)

        context = Object.assign({ f, q, id, target }, context)

        actions = instance.actions.apply(context, [context, context])
        actions.id = id
        if (actions.new) {
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
