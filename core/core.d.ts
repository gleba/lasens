import { AFlow } from 'alak'
export declare type LaAction<T> = T extends {
  actions: (...args: any) => any
}
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any
export declare type FromClass<T> = T extends new (...args: any) => any ? InstanceType<T> : never
declare type ActionsModule<T> = LaAction<FromClass<T>>
declare type StateClassModule<T> = Omit<FromClass<T>, 'actions'>
export declare type StateModule<T> = Omit<T, 'actions'>
declare type ActionModules<T> = {
  readonly [K in keyof T]: ActionsModule<T[K]>
}
export declare type StateModules<T> = {
  readonly [K in keyof T]: StateClassModule<T[K]>
}
export declare type FlowModule<T> = {
  readonly [K in keyof T]: AFlow<T[K]>
}
export declare type FlowModules<T> = {
  readonly [K in keyof T]: FlowModule<T[K]>
}
declare type QuickModule<T> = {
  readonly [K in keyof T]: T[K]
}
export interface La<T> {
  f: FlowModule<StateModule<T>>
  q: QuickModule<StateModule<T>>
}
export declare type LaSensType<T> = {
  actions: ActionModules<T>
  flows: FlowModules<StateModules<T>>
  state: StateModules<T>
}
export declare const META_HOLISTIC = 'holistic'
export declare const META_CLASSNAME = 'classname'
export interface ISens<T> {
  actions: ActionModules<T>
  flows: FlowModules<StateModules<T>>
  state: StateModules<T>
  renew(): any
  newContext(context: any): LaSensType<T>
}
export declare function LaSens<T>(modules: T): ISens<T>
export {}
