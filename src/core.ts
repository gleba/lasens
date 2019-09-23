import {A, AFlow} from 'alak'
import {applyDecors, holisticLive, wakeUp} from './decor'
import {alive, clearObject} from './utils'
import {proxyLoggerAction, proxyLoggerFlow, safeModulePathHandler} from "./proxyHandlers";

// type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

// type StateModule<T> = T extends new (...args: any)=>any ? Omit<InstanceType<T>, "actions"> : never
// type ActionsModule<T> = T extends new (...args: any)=>any ? LaAction<InstanceType<T>> : never

export type LaAction<T> = T extends { actions: (...args: any) => any }
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any

// export interface XModule<T> {
//   actions(f:LaFlow<T>, a: LaAction<T>):any
// }

export type FromClass<T> = T extends new (...args: any) => any ? InstanceType<T> : never
type ActionsModule<T> = LaAction<FromClass<T>>
type StateModule<T> = Omit<FromClass<T>, 'actions'>

type ActionModules<T> = { readonly [K in keyof T]: ActionsModule<T[K]> }
type StateModules<T> = { readonly [K in keyof T]: StateModule<T[K]> }
type FlowModule<T> = { readonly [K in keyof T]: AFlow<T[K]> }
type FlowModules<T> = { readonly [K in keyof T]: FlowModule<T[K]> }

export type LaSensType<T> = {
  actions: ActionModules<T>
  flows: FlowModules<StateModules<T>>
  state: StateModules<T>
}

export const META_HOLISTIC = 'holistic'
export const META_CLASSNAME = 'classname'


export interface ISens<T> {
  actions: ActionModules<T>
  flows: FlowModules<StateModules<T>>

  renew()

  newContext(context: any): LaSensType<T>
}


export function LaSens<T>(
  modules: T,
): ISens<T> {
  const sleepingModules = {} as any
  let awakedFlow = {}
  let awakedActions = {}
  let flowMap = {}
  let usedWays = {}
  let storeId = 0
  const graphProxyHandler = {
    get(o, key) {
      let m = o[key]
      if (!m) {
        awakeModule(key)
        m = o[key]
      }
      return m
    },
  }
  const flows = new Proxy(awakedFlow, graphProxyHandler) as FlowModules<StateModules<T>>
  const actions = new Proxy(awakedActions, graphProxyHandler) as ActionModules<T>
  const things = {
    flows: [flows, proxyLoggerFlow],
    actions: [actions, proxyLoggerAction]
  } as any

  function useContextFor(context) {
    let result = {}
    Object.keys(things).forEach(k => {
      let [thing, proxyH] = things[k]
      result[k] = A.canLog ? new Proxy(thing, proxyH(context)) : thing
    })
    return result as LaSensType<T>
  }

  // const state = new Proxy(awakedActions, graphProxyHandler) as ActionModules<T>
  function awakeModule(modulePath) {
    console.log('✓ awake module :', modulePath)
    let sleepingModule = sleepingModules[modulePath]
    if (!sleepingModule) {
      console.error('Module Name: ', modulePath, ' is not initialised')
    }
    let awakened = new sleepingModule()
    let className = awakened.constructor.name
    let holistic = holisticLive(awakened, className)
    let module = new Proxy({_: {moduleName: modulePath, className}}, safeModulePathHandler)
    Object.keys(awakened).forEach(flowName => {
      let flow = A.flow()
      let initialFlowStateValue = awakened[flowName]
      let isHolistic = holistic[flowName]
      let isAliveValue = alive(initialFlowStateValue)
      if (isHolistic) {
        flow.addMeta(META_HOLISTIC, initialFlowStateValue)
      }
      flow.setId(modulePath + '.' + flowName)
      flow.addMeta(META_CLASSNAME, className)
      if (isAliveValue && !isHolistic) {
        flow(initialFlowStateValue)
      }
      applyDecors(flow, className, flowName)
      module[flowName] = flow
      flowMap[flow.id] = flow
    })
    awakedFlow[modulePath] = module


    if (awakened.actions) {
      let context = useContextFor({modulePath, className})
      awakened.actions.bind(context)
      awakedActions[modulePath] = awakened.actions.apply(context, [Object.assign({f: module}, context), context])
    }
    wakeUp()
    return module
  }

  function renew(): void {
    clearObject(awakedActions)
    clearObject(awakedFlow)
    clearObject(usedWays)
    clearObject(sleepingModules)
    storeId++
    for (let moduleName in modules) {
      sleepingModules[moduleName] = modules[moduleName]
    }
  }


  return {
    renew,
    things,
    newContext: useContextFor,
    ...useContextFor({facade: true})
  } as any

}



