import { AFlow } from 'alak'
import A from 'alak'

import { applyDecors, holisticLive, wakeUp } from './decor'
import {
  alive,
  clearObject,
  DEBUG_FACADE,
  DEBUG_MODULE,
  DEBUG_INIT_FLOW,
  primitiveExceptions,
} from './utils'
import {
  alwaysErrorProxy,
  proxyLoggerAction,
  proxyLoggerFlow,
  safeModulePathHandler,
} from './debugHandlers'
import { stateProxyHandler } from './stateProxyHandler'

export type LaAction<T> = T extends { actions: (...args: any) => any }
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any

// export interface XModule<T> {
//   actions(f:LaFlow<T>, a: LaAction<T>):any
// }

export type FromClass<T> = T extends new (...args: any) => any ? InstanceType<T> : never
type ActionsModule<T> = LaAction<FromClass<T>>
type StateClassModule<T> = Omit<FromClass<T>, 'actions'>
export type StateModule<T> = Omit<T, 'actions'>
type ActionModules<T> = { readonly [K in keyof T]: ActionsModule<T[K]> }
export type StateModules<T> = { readonly [K in keyof T]: StateClassModule<T[K]> }

export type FlowModule<T> = { readonly [K in keyof T]: AFlow<T[K]> }
// export type FlowModule<T> = { readonly [K in keyof T]: AFlow<T[K]> }
export type FlowModules<T> = { readonly [K in keyof T]: FlowModule<T[K]> }

declare type QuickModule<T> = {
  readonly [K in keyof T]: T[K]
}

export interface La<T> {
  f: FlowModule<StateModule<T>>
  q: QuickModule<StateModule<T>>
}

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
  state: StateModules<T>
  renew()

  newContext(context: any): LaSensType<T>
}

export function LaSens<T>(modules: T): ISens<T> {
  const availableModules = () => 'available modules: ' + Object.keys(sleepingModules).toString()
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
        let reasonToSleep = awakeModule(key)
        if (!reasonToSleep) {
          m = o[key]
        } else if (primitiveExceptions[key]) {
          return reasonToSleep
        } else {
          let reasonExplain =
            '[' + key + '] is unavailable module, available path: ' + reasonToSleep.toString()
          return A.canLog ? reasonExplain : alwaysErrorProxy(reasonExplain)
        }
      }
      return m
    },
  }

  const flows = new Proxy(awakedFlow, graphProxyHandler) as FlowModules<StateModules<T>>
  const actions = new Proxy(awakedActions, graphProxyHandler) as ActionModules<T>
  const state = new Proxy(flows, stateProxyHandler()) as ActionModules<T>
  const things = {
    flows: [flows, proxyLoggerFlow],
    actions: [actions, proxyLoggerAction],
    state,
  } as any

  function makeSenseFor(context) {
    let result = { state } as any
    ;['flows', 'actions'].forEach(k => {
      let [thing, proxyH] = things[k]
      if (A.canLog) {
        result[k] = new Proxy(thing, proxyH(context))
      } else {
        result[k] = thing
      }
    })
    return result as LaSensType<T>
  }

  // const state = new Proxy(awakedActions, graphProxyHandler) as ActionModules<T>
  function awakeModule(modulePath) {
    if (primitiveExceptions[modulePath]) {
      return alwaysErrorProxy(availableModules())
    }
    let sleepingModule = sleepingModules[modulePath]
    if (!sleepingModule) {
      console.error('Module by path name: [', modulePath, '] is not found')
      let availableModulesMessage = availableModules()
      console.warn(availableModulesMessage)

      return alwaysErrorProxy(availableModulesMessage)
    }
    console.log('✓ awake module :', modulePath)
    let awakened = new sleepingModule()
    let className = awakened.constructor.name
    let holistic = holisticLive(awakened, className)
    let module = new Proxy({ _: { moduleName: modulePath, className } }, safeModulePathHandler)
    Object.keys(awakened).forEach(flowName => {
      let flow = A()
      let initialFlowStateValue = awakened[flowName]
      let isHolistic = holistic[flowName]
      let isAliveValue = alive(initialFlowStateValue)
      if (isHolistic) {
        flow.addMeta(META_HOLISTIC, initialFlowStateValue)
      }
      flow.setName(flowName)
      flow.setId(modulePath + '.' + flowName)
      flow.addMeta(META_CLASSNAME, className)
      if (isAliveValue && !isHolistic) {
        flow(initialFlowStateValue, DEBUG_INIT_FLOW)
      }
      applyDecors(flow, className, flowName)
      module[flowName] = flow
      flowMap[flow.id] = flow
    })
    awakedFlow[modulePath] = module

    wakeUp()
    if (awakened.actions) {
      let thingsInContext = makeSenseFor([className, modulePath, ...DEBUG_MODULE])
      let f = thingsInContext.flows[modulePath]
      let q = state[modulePath]
      awakened.actions.bind(thingsInContext)
      awakedActions[modulePath] = awakened.actions.apply(thingsInContext, [
        Object.assign({ f, q }, thingsInContext),
        thingsInContext,
      ])
    }
    return false
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
    newContext: makeSenseFor,
    ...makeSenseFor(DEBUG_FACADE),
  } as any
}
