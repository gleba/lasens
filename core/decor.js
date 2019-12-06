'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const utils_1 = require('./utils')
const localstore_1 = require('./localstore')
const debugHandlers_1 = require('./debugHandlers')
const alak_1 = require('alak')
const core_1 = require('./core')
var Decor
;(function(Decor) {
  Decor['Alive'] = 'Alive'
  Decor['Stored'] = 'Stored'
  Decor['LazyGetter'] = 'LazyGetter'
  Decor['Getter'] = 'LazyGetter'
  Decor['Wrapper'] = 'Wrapper'
  Decor['Change'] = 'Change'
})(Decor || (Decor = {}))
const decorModuleMap = new Map()
function clearDecorators() {
  utils_1.clearObject(delay)
}
exports.clearDecorators = clearDecorators
const updateFlowDecor = (df, decor, fx) => {
  if (!df) df = {}
  df[decor] = fx ? fx : true
  return df
}
const addMeta = (decor, classCon, flowName, fx) => {
  let decoratedFlows
  if (decorModuleMap.has(classCon)) {
    decoratedFlows = decorModuleMap.get(classCon)
  } else {
    decoratedFlows = {}
  }
  decoratedFlows[flowName] = updateFlowDecor(decoratedFlows[flowName], decor, fx)
  decorModuleMap.set(classCon, decoratedFlows)
}
const decorFx = decor => f => (target, propertyKey) => {
  addMeta(decor, target.constructor, propertyKey, f)
}
const decorBase = decor => (target, propertyKey) => {
  addMeta(decor, target.constructor, propertyKey)
}
exports.getter = decorFx(Decor.Getter)
exports.lazyGetter = decorFx(Decor.LazyGetter)
exports.wrapper = decorFx(Decor.Wrapper)
exports.changeFx = decorFx(Decor.Change)
exports.stored = decorBase(Decor.Stored)
exports.qubit = decorBase(Decor.Alive)
exports.holistic = decorBase(Decor.Alive)
const delay = []
const getDecors = classCon => (decorModuleMap.has(classCon) ? decorModuleMap.get(classCon) : {})
const mergeKeys = (o1, o2) => Object.keys(o1).concat(Object.keys(o2).filter(k => !o1[k]))
function diamondMoment(instance, moduleName) {
  const classCon = instance.constructor
  const decors = getDecors(classCon)
  const module = { _: { moduleName, classCon } }
  const arousal = []
  mergeKeys(instance, decors).forEach(name => {
    let initialValue = instance[name]
    let flow = utils_1.alive(initialValue) ? alak_1.default(initialValue) : alak_1.default()
    flow.setName(name)
    flow.setId(moduleName + '.' + name)
    flow.addMeta(core_1.META_CLASS, classCon)
    awakening(flow, decors[name])
    module[name] = flow
  })
  function awakening(flow, decors) {
    if (!decors) return
    decors[Decor.Stored] && localstore_1.XStorage.bindFlow(flow)
    let delayed = []
    Object.keys(decors).forEach(decor => {
      switch (decor) {
        case Decor.Alive:
          break
        case Decor.Stored:
          localstore_1.XStorage.bindFlow(flow)
          break
        default:
          delayed.push([decor, decors[decor]])
      }
    })
    arousal.push([flow, delayed])
  }
  const safeModule = new Proxy(module, debugHandlers_1.safeModulePathHandler)
  return [safeModule, arousal]
}
exports.diamondMoment = diamondMoment
function wakeUp(arousal) {
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
exports.wakeUp = wakeUp
