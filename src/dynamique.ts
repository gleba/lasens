import {FromClass, ISens, LaAction, META_CLASSNAME, META_HOLISTIC} from './core'
import {A, AFlow} from "alak";
import {applyDecors, holisticLive, wakeUp} from "./decor";
import {alive} from "./utils";
import {proxyLoggerDynamique, safeModulePathHandler} from "./proxyHandlers";

type StateModule<T> = Omit<T, 'actions'>
type FlowModule<T> = { readonly [K in keyof T]: AFlow<T[K]> }

type DynamiqueModule<T> = {
  actions: LaAction<T>
  flow: FlowModule<StateModule<T>>
}

export type La<T> = {
  f: FlowModule<StateModule<T>>
  state: FlowModule<StateModule<T>>
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
    let module = new Proxy({_: {moduleName: instance, className}}, safeModulePathHandler)
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
        flow(initialFlowStateValue)
      }
      applyDecors(flow, className, flowName)
      module[flowName] = flow
    })
    let actions
    if (instance.actions) {
      let context = Object.assign({id}, store.newContext({id}))
      instance.actions.bind(context)
      actions = instance.actions.apply(context, [Object.assign({f: module}, context), context])
      actions.id = id
      if (actions.new) {
        actions.new(argument)
      }
    }
    wakeUp()
    return {
      flows: module,
      actions
    }
  }

  const satMap = store['satelliteMap'] = new Map()

  function moduleOperations(moduleClass) {
    let instancesMap = satMap.has(moduleClass) ? satMap.get(moduleClass) : new Map()

    function createFrom(argument) {
      let id
      let uid = Math.random()
      if (argument) {
        switch (typeof argument) {
          case "string":
          case "number":
          case "symbol":
          case "bigint":
            id = argument
            break
          default:
            if (argument.id) id = argument.id
        }
      }
      if (!id) id = uid
      if (instancesMap.has(id))
        return instancesMap.get(id)

      const module = create(moduleClass, id, argument)
      instancesMap.set(id, module)
      satMap.set(moduleClass, instancesMap)
      return module
    }

    const broadcastHandler = {
      get({way}, key) {
        return (...args) => instancesMap.forEach(m => {
          let fway = m[way]
          if (fway) {
            let fkey = fway[key]
            if (fkey) {
              return fkey(...args)
            }
          }
        })
      }
    }
    return Object.assign(createFrom, {
      broadcast: {
        flows: new Proxy({way: "flows"}, broadcastHandler),
        actions: new Proxy({way: "actions"}, broadcastHandler)
      },
      create: createFrom,
      getById: id => instancesMap.has(id) ? instancesMap.get(id) : undefined,
      removeById: id => instancesMap.has(id) ? instancesMap.delete(id) : undefined
    })
  }

  const dynamique = new Proxy(modules as any, {
    get(o, key) {
      let m = o[key]
      if (m) return moduleOperations(m)
      else throw "Dynamique module " + key.toString() + " not present"
    }
  })

  store['things'].dynamique = [dynamique, proxyLoggerDynamique]
  store['dynamique'] = dynamique
  return store as any
}
