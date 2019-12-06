import { alive, clearObject } from './utils'
import { XStorage } from './localstore'
import { safeModulePathHandler } from './debugHandlers'
import A from 'alak'
import { META_CLASS } from './core'

enum Decor {
  Alive = 'Alive',
  Stored = 'Stored',
  LazyGetter = 'LazyGetter',
  Getter = 'LazyGetter',
  Wrapper = 'Wrapper',
  Change = 'Change',
}
const decorModuleMap = new Map()

export function clearDecorators() {
  clearObject(delay)
}

const updateFlowDecor = (df, decor, fx) => {
  if (!df) df = {}
  df[decor] = fx ? fx : true
  return df
}

const addMeta = (decor, classCon, flowName, fx?) => {
  let decoratedFlows
  if (decorModuleMap.has(classCon)) {
    decoratedFlows = decorModuleMap.get(classCon)
  } else {
    decoratedFlows = {}
  }
  decoratedFlows[flowName] = updateFlowDecor(decoratedFlows[flowName], decor, fx)
  decorModuleMap.set(classCon, decoratedFlows)
}

const decorFx = (decor: Decor) => (f: Function): PropertyDecorator => (
  target: Object,
  propertyKey: string | symbol,
) => {
  addMeta(decor, target.constructor, propertyKey, f)
}
const decorBase = (decor: Decor) => (target: Object, propertyKey: string | symbol) => {
  addMeta(decor, target.constructor, propertyKey)
}
export const getter = decorFx(Decor.Getter)
export const lazyGetter = decorFx(Decor.LazyGetter)
export const wrapper = decorFx(Decor.Wrapper)
export const changeFx = decorFx(Decor.Change)
export const stored = decorBase(Decor.Stored)
export const qubit = decorBase(Decor.Alive)
export const holistic = decorBase(Decor.Alive)

const delay = [] as any[]

const getDecors = classCon => (decorModuleMap.has(classCon) ? decorModuleMap.get(classCon) : {})
const mergeKeys = (o1, o2) => Object.keys(o1).concat(Object.keys(o2).filter(k => !o1[k]))

export function diamondMoment(instance, moduleName) {
  const classCon = instance.constructor
  const decors = getDecors(classCon)
  const module = { _: { moduleName, classCon } }
  const arousal = []

  mergeKeys(instance, decors).forEach(name => {
    let initialValue = instance[name]
    let flow = alive(initialValue) ? A(initialValue) : A()
    flow.setName(name)
    flow.setId(moduleName + '.' + name)
    flow.addMeta(META_CLASS, classCon)
    awakening(flow, decors[name])
    module[name] = flow
  })

  function awakening(flow, decors) {
    if (!decors) return
    decors[Decor.Stored] && XStorage.bindFlow(flow)
    let delayed = []
    Object.keys(decors).forEach(decor => {
      switch (decor as any) {
        case Decor.Alive:
          break
        case Decor.Stored:
          XStorage.bindFlow(flow)
          break
        default:
          delayed.push([decor, decors[decor]])
      }
    })
    arousal.push([flow, delayed])
  }

  const safeModule = new Proxy(module, safeModulePathHandler)
  return [safeModule, arousal]
}
export function wakeUp(arousal) {
  arousal.forEach(([flow, delayed]) =>
    delayed.forEach(([decor, fx]) => {
      switch (decor) {
        case Decor.Wrapper:
          flow.useWrapper(decor)
          break
        case Decor.Getter:
          flow.useGetter(decor)
          flow()
          break
        case Decor.Change:
          flow.up(decor)
          break
      }
    }),
  )
}
