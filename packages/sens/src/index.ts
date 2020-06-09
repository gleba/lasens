/// <reference path="../index.d.ts"/>
import { awake, getup } from './awake'
import { A } from 'alak'

export interface LasDomain {}


export abstract class DomainSens<Thing, IDomain>
  implements ILaSensStore<Thing, LasDomain> {

  _decay?(): void
  _?: LosPrivateFrom<Thing>
  _private?: PrivateFlow
  _holistic?: any
  $: LosAtomized<RmFunc<Thing>>
  $atoms?: DomainAtoms<IDomain>
  $actions?: DomainActions<IDomain>
  $uid?: string | number
  $id?: string | number
  $target?: any

}

export abstract class Sens<Thing> extends DomainSens<Thing, LasDomain> {}


export interface IWay {
  thing: any
  lifeCycle?: LifeCycleOption
  domain?: string
  multi?: boolean
}

export function MakeThing<T>(thing: T): Thing<T> {
  const way: IWay = {
    thing,
    domain:"los"
  }
  const finalSteeps = {
    register: () => register(way),
    multiRegister: () => multiRegister(way),
  }
  function domain(name) {
    way.domain = name
    return finalSteeps
  }
  return {
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
}

export interface IBox {
  isSleep: boolean
  wakeUp: Function
  way: IWay
  awakened?: any
}

export {
 stored
} from "./decor"

export {
  newRune
} from "./utils"

function multiRegister(way: IWay) {
  const activities = new Map()
  const register = A.stateless()
  function getter(target) {
    let id, key
    let uid = Math.random()
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
  getter.onNewRegistration = f=>register.up(v=>f(v.activity))
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
  return new Proxy(box, boxHandlers) as any
}

const boxHandlers = {
  get(box: IBox, p: PropertyKey, receiver: any): any {
    box.isSleep && box.wakeUp()
    return box.awakened[p]
  },
  // set(box: IBox, p: PropertyKey, value: any, receiver: any): boolean {
  //   box.isSleep && box.wakeUp()
  //   box.awakened[p] = p
  //   return true
  // },
}
