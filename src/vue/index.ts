import {ISens} from "../core";
import {installMixin} from "./install-mixin";
import {AFlow} from "alak";

type LaVueAFlow<T> = AFlow<T> & {
  as: (nameInTemplate: string, wrapper?: (v: T) => any) => LaVueAFlow<T>
  asIs: (wrapper?: (v: T) => any) => LaVueAFlow<T>
  // on: (event: string, listiner: Function) => void
  // up(fn: (value: T) => void): void
  // match(...pattern: any[]): any
}

type FlowModule<T> = { readonly [K in keyof T]: LaVueAFlow<T[K]> }
type FlowModules<T> = { readonly [K in keyof T]: FlowModule<T[K]> }
type StateModule<T extends ISens<any>> = T['flows']

export interface LaVueCO<T extends ISens<any>> {
  (sens: FlowModules<StateModule<T>>)
}


export function LaVue<T>(sens: ISens<T>) {
  sens.renew()
  return {
    install(_Vue: any, options: any, ...a) {
      _Vue.mixin(installMixin(sens))
    }
  }
}

