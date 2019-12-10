import { ActionFnResult, ExtractClass, ISens, La } from './core'
import { AFlow } from 'alak'
declare type StateModule<T> = Omit<T, 'actions'>
declare type FlowModule<T> = {
  readonly [K in keyof T]: AFlow<T[K]>
}
export declare type DynamiqueFromStore<T> = T extends {
  dynamique: any
}
  ? T['dynamique']
  : any
export interface Do<T, S> extends La<T, S> {
  id: string | number
  target: any
  free: void
  dynamique: DynamiqueFromStore<S>
}
export declare type LaAction<T> = T extends {
  actions: (...args: any) => any
}
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any
declare type DynamiqueModule<T> = {
  actions: ActionFnResult<T>
  flow: FlowModule<StateModule<T>>
}
declare type DynamiqueModules<T> = {
  [K in keyof T]: {
    (target?: any): DynamiqueModule<ExtractClass<T[K]>>
    broadcast: DynamiqueModule<ExtractClass<T[K]>>
    create(o?: any): DynamiqueModule<ExtractClass<T[K]>>
    getById(id: string | number): DynamiqueModule<ExtractClass<T[K]>>
    removeById(id: string | number): void
  }
}
export interface IDynamique<U, T> extends ISens<U> {
  dynamique: DynamiqueModules<T>
}
export declare function Dynamique<U, T>(store: ISens<U>, modules: T): IDynamique<U, T>
export {}
