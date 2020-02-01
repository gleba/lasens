import { AFlow } from 'alak'
import A from 'alak'

import { diamondMoment, wakeUp } from './decor'
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

export type ActionFnResult<T> = T extends { actions: (...args: any) => any }
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any

// export interface XModule<T> {
//   actions(f:LaFlow<T>, a: ActionFnResult<T>):any
// }

export type ExtractClass<T> = T extends new (...args: any) => any ? InstanceType<T> : never
type ActionKeysInClassFromObject<T> = ActionFnResult<ExtractClass<T>>
type RemoveActionKey<T> = Omit<ExtractClass<T>, 'actions'>
export type OnlyFlows<T> = Omit<T, 'actions'>
export type ActionsFromClassKeysIn<T> = {
  readonly [K in keyof T]: ActionKeysInClassFromObject<T[K]>
}
export type KeysInClassesFrom<T> = { readonly [K in keyof T]: RemoveActionKey<T[K]> }

/**
 * @internal
 */
export type FlowObject<T> = { readonly [K in keyof T]: AFlow<T[K]> }
// export type FlowObject<T> = { readonly [K in keyof T]: AFlow<T[K]> }
export type ClassKeysAsFlow<T> = { readonly [K in keyof T]: FlowObject<T[K]> }

declare type QuickModule<T> = {
  readonly [K in keyof T]: T[K]
}
export type ActionsFromStore<T> = T extends { actions: any } ? T['actions'] : any

export type FlowsFromStore<T> = T extends { flows: any } ? T['flows'] : any
export type StateFromStore<T> = T extends { state: any } ? T['state'] : any


/**
 * Аргументы функции конструктора модуля - actions
 * @param Module текущий класс
 * @param IStore тип хранилища
 * @public
 */
export interface La<Module, IStore> {
  /**
   * функторы потока текущего класса
   */
  f: FlowObject<OnlyFlows<Module>>
  /**
   * данные функторов потока текущего класса
   */
  q: QuickModule<OnlyFlows<Module>>
  /**
   * действия доступные в хранилище
   */
  actions: ActionsFromStore<IStore>
  /**
   * потоки доступные в хранилище
   */
  flows: FlowsFromStore<IStore>
  state: StateFromStore<IStore>
}

export interface LaSensType<T> {
  actions: ActionsFromClassKeysIn<T>
  flows: ClassKeysAsFlow<KeysInClassesFrom<T>>
  state: KeysInClassesFrom<T>
}

// export const META_HOLISTIC = 'holistic'
export const META_MODULE_PATH = 'module_path'
export const META_CLASS = 'class'

export interface ISens<T> {
  actions: ActionsFromClassKeysIn<T>
  flows: ClassKeysAsFlow<KeysInClassesFrom<T>>
  state: KeysInClassesFrom<T>

  renew(): ISens<T>
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
        let reasonToSleep = wakeUpModule(key)
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

  const flows = new Proxy(awakedFlow, graphProxyHandler) as ClassKeysAsFlow<KeysInClassesFrom<T>>
  const actions = new Proxy(awakedActions, graphProxyHandler) as ActionsFromClassKeysIn<T>
  const state = new Proxy(flows, stateProxyHandler())
  const things = {
    flows: [flows, proxyLoggerFlow],
    actions: [actions, proxyLoggerAction],
    state: [state],
  } as any

  function makeSenseFor(context) {
    let result = {} as any
    Object.keys(things).forEach(k => {
      let [thing, proxyH] = things[k]
      if (A.canLog) {
        result[k] = new Proxy(thing, proxyH(context))
      } else {
        result[k] = thing
      }
    })
    return result as LaSensType<T>
  }

  // const state = new Proxy(awakedActions, graphProxyHandler) as ActionsFromClassKeysIn<T>
  function wakeUpModule(modulePath) {
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
    const instance = new sleepingModule()
    const [safeModule, arousal] = diamondMoment(instance, modulePath)
    awakedFlow[modulePath] = safeModule
    wakeUp(arousal)

    console.log('✓ awake module :', modulePath)

    if (instance.actions) {
      let context = makeSenseFor([instance.constructor, modulePath, ...DEBUG_MODULE])
      const f = context.flows[modulePath]
      const q = context.state[modulePath]
      context = Object.assign(context, { f, q })
      awakedActions[modulePath] = instance.actions.apply(context, [context, context])
    }
    return false
  }

  const sens = {
    renew,
    things,
    newContext: makeSenseFor,
    ...makeSenseFor(DEBUG_FACADE),
  }

  function renew() {
    clearObject(awakedActions)
    clearObject(awakedFlow)
    clearObject(usedWays)
    clearObject(sleepingModules)
    storeId++
    for (let moduleName in modules) {
      sleepingModules[moduleName] = modules[moduleName]
    }
    return sens
  }
  return sens
}
