import {alive, clearObject} from "./utils";
import {XStorage} from "./localstore";


enum Decor {
  Getter = 'getter',
  Wrapper = 'wrapper',
  Change = 'change',
  Stored = 'stored',
}
const decorModuleMap = {}
const holisticFlowMap = {}
const qubitFlowMap = {}

export function clearDecorators() {
  clearObject(delay)
}

const upGet = <T>(o, key) => {
  let v = o[key]
  if (!v) v = o[key] = {}
  return v
}

const addMetaMap = (mutator, module, key, fx) => {
  upGet(upGet(decorModuleMap, module), key)[mutator] = fx
}
export function getter(f: Function): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    addMetaMap(Decor.Getter, target.constructor.name, propertyKey, f)
  }
}
export function wrapper(f: Function): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    addMetaMap(Decor.Wrapper, target.constructor.name, propertyKey, f)
  }
}
export function changeFx(f: Function): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    addMetaMap(Decor.Change, target.constructor.name, propertyKey, f)
  }
}

export function stored(target: Object, propertyKey: string | symbol) {
  addMetaMap(Decor.Stored, target.constructor.name, propertyKey, true)
}

export function qubit(target: Object, propertyKey: string | symbol) {
  upGet(qubitFlowMap, target.constructor.name)[propertyKey] = true
}
export function holistic(target: Object, propertyKey: string | symbol) {
  upGet(holisticFlowMap, target.constructor.name)[propertyKey] = true
}

export function extra(target: Object, propertyKey: string | symbol) {

  // return {
  //   xx :{
  //     aa:'ok'
  //   }
  // }
}

export function holisticLive(module, className) {
  let holisticFlow = holisticFlowMap[className]
  let qubitFlow = qubitFlowMap[className]
  let holistic = {}
  if (qubitFlow)
    Object.keys(qubitFlow).forEach(n => {
      if (!alive(module[n])) module[n] = null
    })
  if (holisticFlow)
    Object.keys(holisticFlow).forEach(n => {
      if (!alive(module[n])) module[n] = null
      holistic[n] = true
    })
  return holistic
}

export function applyDecors(flow, moduleName, flowName) {
  let decorMap = decorModuleMap[moduleName]
  if (decorMap) {
    let decors = decorMap[flowName]
    if (decors) {
      warmUp(flow, decors)
    }
  }
}
const delay = [] as any[]
function warmUp(flow, decors) {
  let delayed = {}
  Object.keys(decors).forEach(v => {
    let decor = decors[v]
    switch (v) {
      case Decor.Stored:
        XStorage.bindFlow(flow)
        break
      default:
        delayed[v] = decor
    }
  })
  if (Object.keys(delayed).length) {
    delay.push([flow, delayed])
  }
}
export function wakeUp() {
  delay.forEach(([flow, decors]) => {
    Object.keys(decors).forEach(v => {
      let decor = decors[v]
      switch (v) {
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
    })
  })
  delay.length = 0
}
