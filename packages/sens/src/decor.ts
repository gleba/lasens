import { clearObject } from './utils'
import { Storage } from './storage'

enum Decor {
  // Alive = 'alive',
  // Getter = 'getter',
  // LazyGetter = 'lazyGetter',
  // Wrapper = 'wrapper',
  // Change = 'change',
  // Atom = 'atom',
  Stored = 'stored',
  Portal = 'portal',
  Sync = 'sync',
}
const decorModuleMap = new Map()

/**
 * @internal
 */
export function clearDecorators() {
  clearObject(delay)
}

const updateFlowDecor = (df, decor, fx) => {
  if (!df) df = {}
  df[decor] = fx ? fx : false
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

const decorFx = (decor: Decor) => (fx: any): PropertyDecorator => (
  target: Object,
  propertyKey: string | symbol
) => {
  addMeta(decor, target.constructor, propertyKey, fx)
}

const decorBase = (decor: Decor) => (
  target: Object,
  propertyKey: string | symbol
) => {
  addMeta(decor, target.constructor, propertyKey)
}

// export const getter = decorFx(Decor.Getter)
// export const lazyGetter = decorFx(Decor.LazyGetter)
// export const wrapper = decorFx(Decor.Wrapper)
// export const changeFx = decorFx(Decor.Change)
// export const atom = decorBase(Decor.Atom)
// export const qubit = decorBase(Decor.Alive)

export const stored = decorBase(Decor.Stored)
export const portal = decorBase(Decor.Portal)
export const sync = decorBase(Decor.Sync) // as (key?: string) => PropertyDecorator
const delay = [] as any[]

const getDecors = classCon =>
  decorModuleMap.has(classCon) ? decorModuleMap.get(classCon) : {}

let syncFx = null
export function addSyncHandler(handler: (atom: IAtom<any>, key: string) => void) {
  syncFx = handler
}
const decorImplement = {
  [Decor.Stored]: atom => Storage.init(atom),
  [Decor.Portal](atom: IAtom<any>) {
    atom.stateless(true)
    atom.holistic(true)
  },
  [Decor.Sync](atom, fx) {
    if (syncFx) syncFx(atom, fx)
    else throw 'assign "addSyncHandler(handler)" to use @sync decorator'
  },
} as {
  [s: string]: (atom: IAtom<any>, fx?) => void
}

/**
 * @internal
 */
export function decorate(proxyAtoms, classCon) {
  const classDecors = getDecors(classCon)
  Object.keys(classDecors).forEach(key => {
    const decors = classDecors[key]
    const atom = proxyAtoms[key]
    Object.keys(decors).forEach(decor => {
      const decorFn = decorImplement[decor]
      const decorFx = decors[decor]
      decorFn && decorFn(atom, decorFx)
    })
  })
}
