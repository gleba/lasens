/// <reference path="../index.d.ts"/>
import { awake, getup } from './awake'
import { A } from 'alak'

export interface DomainNamespaces {}

export abstract class DomainSens<Thing, IDomain>
// implements ILaSensStore<Thing, LasDomain>
{
  // _decay?(): void
  // _?: LosPrivateFrom<Thing>
  // _private?: PrivateFlow
  // _?: any
  $: LosAtomized<RmFunc<Thing>>
  $ns?: IDomain
  $uid?: string | number
  $id?: string | number
  $target?: any
}

export abstract class Sens<Thing> extends DomainSens<Thing, DomainNamespaces> {}

export interface IWay {
  thing: any
  lifeCycle?: LifeCycleOption
  domain?: string
  multi?: boolean
  privateThings?: any
  publicAction?: any
  constructor?: any
}

export function MakeThing<T>(thing: T): Thing<T> {
  const way: IWay = {
    thing,
    domain: 'domain',
  }
  const finalSteeps = {
    register: () => register(way),
    multiRegister: () => multiRegister(way),
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
        ...finalSteeps,
      }
    },
    ...finalSteeps,
  } as Thing<T>
  function constructor(f) {
    way.constructor = f
    return middleSteps
  }
  function publicActions(publicThings) {
    way.publicAction = publicThings
    return {
      constructor,
      ...middleSteps,
    }
  }
  function privateAtoms(privateThings) {
    way.privateThings = privateThings
    return {
      constructor,
      publicActions,
      ...middleSteps,
    }
  }
  return {
    constructor,
    publicActions,
    privateAtoms,
    ...middleSteps,
  }
}

export interface IBox {
  isSleep: boolean
  wakeUp: Function
  way: IWay
  awakened?: any
}

export { stored } from './decor'
export { setCustomStorage } from './storage'
export { makeRune } from './utils'

function multiRegister(way: IWay) {
  const activities = new Map()
  const register = A.stateless()
  function getter(target) {
    let key
    if (target) {
      switch (typeof target) {
        case 'string':
        case 'number':
        case 'symbol':
        case 'bigint':
          key = target
          break
        default:
          if (target.id) key = target.id
      }
    }
    if (activities.has(key)) return activities.get(key)
    let activity = getup(way, key, target)
    activities.set(key, activity)
    register({ activity })
    return activity
  }
  getter.remove = () => {}
  getter.broadcast = () => {}
  getter.onNewRegistration = f => register.up(v => f(v.activity))
  if (way.domain) {
    ns[way.domain] = getter
  }
  return getter as any
}

function register(way: IWay) {
  const box: IBox = {
    isSleep: true,
    way,
    wakeUp,
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

const boxHandlers = {
  get(box: IBox, p: PropertyKey): any {
    box.isSleep && box.wakeUp()
    return box.awakened[p]
  },
}

const ns: DomainNamespaces = {}
export default ns
