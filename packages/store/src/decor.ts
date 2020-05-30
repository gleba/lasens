import { clearObject } from './utils'
import { alive } from 'alak/atom/utils'
import { XStorage } from './xstorage/xstorage'
import { addAtom } from './awake'

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
  decoratedFlows[flowName] = updateFlowDecor(
    decoratedFlows[flowName],
    decor,
    fx
  )
  decorModuleMap.set(classCon, decoratedFlows)
}

const decorFx = (decor: Decor) => (f: Function): PropertyDecorator => (
  target: Object,
  propertyKey: string | symbol
) => {
  addMeta(decor, target.constructor, propertyKey, f)
}
const decorBase = (decor: Decor) => (
  target: Object,
  propertyKey: string | symbol
) => {
  console.log('add decor', target.constructor, propertyKey)

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

const getDecors = classCon =>
  decorModuleMap.has(classCon) ? decorModuleMap.get(classCon) : {}

const mergeKeys = (o1, o2) =>
  Object.keys(o1).concat(Object.keys(o2).filter(k => !o1[k]))

export function decorate(body, classCon, domain?) {
  const decors = getDecors(classCon)

  Object.keys(decors).forEach(key => {
    const decor = decors[key]
    if (decor[Decor.Stored]) {
      let atom = body[key] || addAtom(key, body, domain)
      XStorage.bindFlow(atom)
    }
  })
}
