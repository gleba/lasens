/// <reference path="../index.d.ts"/>
import { awake, getup } from './awake'

export interface Domain {}


export abstract class DomainStore<Thing, IDomain>
  implements ILaSensStore<Thing, Domain> {

  _decay?(): void
  _?: LasPrivateFrom<Thing>
  _private: PrivateFlow
  $: LasAtomized<RmFunc<Thing>>
  $atoms?: DomainAtoms<IDomain>
  $actions?: DomainActions<IDomain>
  $uid?: string | number
  $id?: string | number
  $object?: any

}

export abstract class Store<Thing> extends DomainStore<Thing, Domain> {}


export interface IWay {
  thing: any
  lifeCycle?: LifeCycleOption
  domain?: string
  multi?: boolean
}

export function MakeThing<T>(thing: T): Thing<T> {
  const way: IWay = {
    thing,
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

function multiRegister(way: IWay) {
  const activities = new Map()
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
    return activity
  }
  getter.remove = () => {}
  getter.broadcast = () => {}
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
  set(box: IBox, p: PropertyKey, value: any, receiver: any): boolean {
    box.isSleep && box.wakeUp()
    box.awakened[p] = p
    return true
  },
}
