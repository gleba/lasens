import {ISens} from "../core";
import {installMixin} from "./install-mixin";

interface LaVueAFlow<T> {
  as: (nameInTemplate: string) => void
  on: (event: string, listiner: Function) => void

  up(fn: (value: T) => void): void

  match(...pattern: any[]): any
}

type FlowModule<T> = { readonly [K in keyof T]: LaVueAFlow<T[K]> }
type FlowModules<T> = { readonly [K in keyof T]: FlowModule<T[K]> }
type StateModule<T extends ISens<any>> = T['flows']

export interface LaVueCO<T extends ISens<any>> {
  (sens: FlowModules<StateModule<T>>)
}


export function LaVue<T>(sens: ISens<T>) {


  return {
    install(_Vue: any, options: any, ...a) {
      // GlobalState.init(_Vue)
      // plugins.forEach(p=>p.patchModules(this.storeModules))
      // actions.set(this.storeModules)
      // createNodes(this.storeModules)
      // createEdges(this.storeModules)
      // graphEdges()
      //
      // let gate = newGate('Ω')
      //
      // _Vue.prototype.$a = sens.actions
      // _Vue.prototype.$f = sens.flows

      _Vue.mixin(installMixin(sens))

    }
  }
}

