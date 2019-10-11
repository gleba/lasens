import {AFlow} from 'alak'


export interface Obj<V> {
  [s: string]: V
}

export const extractEventTarget = <T>(f: AFlow<T>) => (e: any) => f(e.target.value)
export const alive = v => (v !== undefined && v !== null) as boolean
export const isTruth = v => !!v
export const nullFilter = f => v => (alive(v) ? f(v) : null)
export const eTargetValue = (f: Function | any, clearError?: Function) => e => {
  f(e.target.value)
  if (clearError) {
    clearError(false)
  }
}

export const onEnter = (f: Function) => e => {
  if (e.key === 'Enter') {
    f()
    e.preventDefault()
  }
}

export const toDicById = list => {
  let o = {}
  if (list)
    list.forEach(n => {
      o[n.id] = n
    })
  return o
}

export function flatFlowObject(o: Obj<AFlow<any>>): Obj<any> {
  let n = {}
  Object.keys(o).forEach(k => {
    n[k] = o[k].value
  })
  return n
}

export const clearObject = o => Object.keys(o).forEach(n => delete o[n])


export const DEBUG_LA_SENS = "lasens"

export const DEBUG_INIT_FLOW = ["init", DEBUG_LA_SENS]
export const DEBUG_FACADE = ["facade", DEBUG_LA_SENS]
export const DEBUG_MODULE = ["module", DEBUG_LA_SENS]
export const DEBUG_VIEW = ["view", DEBUG_LA_SENS]
export const DEBUG_DYN_MODULE = ["dyn_module", DEBUG_LA_SENS]
