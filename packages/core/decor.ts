import { alive, clearObject } from './utils'
import { XStorage } from './localstore'
import { safeModulePathHandler } from './debugHandlers'
import A from 'alak'
import { META_CLASS, META_MODULE_PATH } from './core'

enum Decor {
  Alive = 'alive',
  Stored = 'stored',
  Getter = 'getter',
  LazyGetter = 'lazyGetter',
  Wrapper = 'wrapper',
  Change = 'change',
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
/**
 * Декоратор для сохранения в localStorage значения контейнера.
 * @public
 */
export const stored = decorBase(Decor.Stored)
/**
 * Декоратор для инициализации пустого значения класса.
 * @public
 */
export const qubit = decorBase(Decor.Alive)
export const holistic = decorBase(Decor.Alive)

const delay = [] as any[]

const getDecors = classCon => (decorModuleMap.has(classCon) ? decorModuleMap.get(classCon) : {})
const mergeKeys = (o1, o2) => Object.keys(o1).concat(Object.keys(o2).filter(k => !o1[k]))

export function diamondMoment(instance, modulePath) {
  const classCon = instance.constructor
  const decors = getDecors(classCon)
  const module = { _: { modulePath, classCon } }
  const arousal = []

  mergeKeys(instance, decors).forEach(name => {
    let initialValue = instance[name]
    let flow = alive(initialValue) ? A(initialValue) : A()
    flow.setName(name)
    flow.setId(modulePath + '.' + name)
    flow.addMeta(META_CLASS, classCon)
    flow.addMeta(META_MODULE_PATH, modulePath)
    awakening(flow, decors[name])
    module[name] = flow
  })

  function awakening(atom, decors) {
    if (!decors) return
    decors[Decor.Stored] && XStorage.bindFlow(atom)
    let delayed = []
    Object.keys(decors).forEach(decor => {
      switch (decor as any) {
        case Decor.Alive:
          break
        case Decor.Stored:
          XStorage.bindFlow(atom)
          break
        default:
          delayed.push([decor, decors[decor]])
      }
    })
    arousal.push([atom, delayed])
  }

  const safeModule = new Proxy(module, safeModulePathHandler)
  return [safeModule, arousal]
}
export function wakeUp(arousal) {
  arousal.forEach(([atom, delayed]) =>
    delayed.forEach(([decor, fx]) => {
      switch (decor) {
        case Decor.Wrapper:
          atom.useWrapper(fx)
          break
        case Decor.Getter:
          atom.useGetter(fx)
          atom()
          break
        case Decor.LazyGetter:
          atom.useGetter(fx)
          break
        case Decor.Change:
          atom.up(decor)
          break
      }
    }),
  )
}
