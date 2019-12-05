import { FromClass, ISens, LaAction } from './core'
import { AFlow } from 'alak'
declare type StateModule<T> = Omit<T, 'actions'>
declare type FlowModule<T> = {
  readonly [K in keyof T]: AFlow<T[K]>
}
declare type QuickModule<T> = {
  readonly [K in keyof T]: T[K]
}
export interface La<T> {
  f: FlowModule<StateModule<T>>
  q: QuickModule<StateModule<T>>
}
declare type DynamiqueModule<T> = {
  actions: LaAction<T>
  flow: FlowModule<StateModule<T>>
}
declare type DynamiqueModules<T> = {
  [K in keyof T]: {
    (target?: any): DynamiqueModule<FromClass<T[K]>>
    broadcast: DynamiqueModule<FromClass<T[K]>>
    create(o?: any): DynamiqueModule<FromClass<T[K]>>
    getById(id: string | number): DynamiqueModule<FromClass<T[K]>>
    removeById(id: string | number): void
  }
}
export interface IDynamique<U, T> extends ISens<U> {
  dynamique: DynamiqueModules<T>
}
export declare function Dynamique<U, T>(store: ISens<U>, modules: T): IDynamique<U, T>
export {}
