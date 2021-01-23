/// <reference path="../index.d.ts"/>
import { awake, deepAwake } from './awake'
import { A } from 'alak'

export interface NS {
}

export abstract class DomainSens<T, IDomain>
// implements ILaSensStore<Thing, LasDomain>
{
  // _decay?(): void
  // _?: LosPrivateFrom<Thing>
  // _private?: PrivateFlow
  // _?: any
  $: LosAtomized<RmFunc<T>>
  $ns?: NS //RmType<NS, Thing<T>>
  $uid?: string | number
  $id?: string | number
  $target?: any
}

export abstract class Sens<Thing> extends DomainSens<Thing, NS> {
}

export interface IWay {
  thing: any
  lifeCycle?: LifeCycleOption
  domain?: string
  multi?: boolean
  privateThings?: any
  publicAction?: any
  controller?: any
}

export function MakeThing<T>(model: T): MiddleThink<T> {
  const way: IWay = {
    thing: model,
    domain: 'domain'
  }
  const finalSteeps = {
    register: () => register(way),
    multiRegister: () => multiRegister(way)
  }

  function domain(name) {
    way.domain = name
    return finalSteeps
  }

  const middleSteps = {
    domain,
    lifeCycle(choices) {
      way.lifeCycle = choices
      return {
        domain,
        ...finalSteeps
      }
    },
    ...finalSteeps
  } as MiddleThink<T>

  function controller(f) {
    way.controller = f
    return middleSteps
  }

  return {
    controller,
    ...middleSteps
  }
}

export interface IBox {
  isSleep: boolean
  wakeUp: Function
  way: IWay
  awakened?: any
}

function multiRegister(way: IWay) {
  const activities = new Map()
  const register = A.stateless()

  function getter(target) {
    let key
    if (target) {
      switch (typeof target) {
        case 'number':
          key = target
          break
        case 'string':
        case 'symbol':
        case 'bigint':
          key = target
          break
        default:
          if (target.id) key = target.id
      }
    }
    if (activities.has(key)) return activities.get(key)
    let activity = deepAwake(way, key, target)
    activities.set(key, activity)
    register({ activity })
    return activity
  }

  getter.remove = (key) => {
    activities.has(key) && activities.delete(key)
  }

  getter.broadcast = new Proxy({}, {
    get(target: {}, p: PropertyKey, receiver: any): any {
      return (...args) => activities.forEach(activity => {
        activity[p](...args)
      })
    }
  })
  getter.forEach = receiver => activities.forEach(receiver)
  getter.onNewRegistration = f => register.up(v => f(v.activity))
  getter.async = target => {
    const instance = getter(target)
    if (instance.__.nowPromise) {
      return new Promise(resolve =>
        instance.__.nowPromise.then(() =>
          resolve(new Proxy(instance, thenHandler))
        )
      )
    }
    return instance
  }
  if (way.domain) {
    ns[way.domain] = getter
  }
  // if (way.lifeCycle) {
  //   way.lifeCycle.decayByInactivity
  //
  // }
  return getter as any
}

function register(way: IWay) {
  const box: IBox = {
    isSleep: true,
    way,
    wakeUp
  }
  way.lifeCycle?.immediatelyStart && wakeUp()

  function wakeUp() {
    delete box.wakeUp
    box.isSleep = false
    box.awakened = awake(box)
  }

  let proxyBox = new Proxy(box, boxHandlers) as any
  if (way.domain) {
    ns[way.domain] = proxyBox
  }
  return proxyBox
}

const thenHandler = {
  get(o, k) {
    if (k == 'then') return o
    return o[k]
  }
}

const boxHandlers = {
  get(box: IBox, p: PropertyKey): any {
    box.isSleep && box.wakeUp()
    return box.awakened[p]
  }
}

// export { stored } from './decor'
// export { setCustomStorage } from './storage'

export { makeRune } from './utils'
const ns: NS = {}
export default ns
