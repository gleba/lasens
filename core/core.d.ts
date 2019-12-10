import { AFlow } from 'alak'
export declare type ActionFnResult<T> = T extends {
  actions: (...args: any) => any
}
  ? Omit<ReturnType<T['actions']>, 'new'>
  : any
export declare type ExtractClass<T> = T extends new (...args: any) => any ? InstanceType<T> : never
declare type ActionKeysInClassFromObject<T> = ActionFnResult<ExtractClass<T>>
declare type RemoveActionKey<T> = Omit<ExtractClass<T>, 'actions'>
export declare type OnlyFlows<T> = Omit<T, 'actions'>
export declare type ActionsFromClassKeysIn<T> = {
  readonly [K in keyof T]: ActionKeysInClassFromObject<T[K]>
}
export declare type KeysInClassesFrom<T> = {
  readonly [K in keyof T]: RemoveActionKey<T[K]>
}
export declare type FlowObject<T> = {
  readonly [K in keyof T]: AFlow<T[K]>
}
export declare type ClassKeysAsFlow<T> = {
  readonly [K in keyof T]: FlowObject<T[K]>
}
declare type QuickModule<T> = {
  readonly [K in keyof T]: T[K]
}
export declare type ActionsFromStore<T> = T extends {
  actions: any
}
  ? T['actions']
  : any
export declare type FlowsFromStore<T> = T extends {
  flows: any
}
  ? T['flows']
  : any
export declare type StateFromStore<T> = T extends {
  state: any
}
  ? T['state']
  : any
export interface La<T, S> {
  f: FlowObject<OnlyFlows<T>>
  q: QuickModule<OnlyFlows<T>>
  actions: ActionsFromStore<S>
  flows: FlowsFromStore<S>
  state: StateFromStore<T>
}
export interface LaSensType<T> {
  actions: ActionsFromClassKeysIn<T>
  flows: ClassKeysAsFlow<KeysInClassesFrom<T>>
  state: KeysInClassesFrom<T>
}
export declare const META_CLASS = 'class'
export interface ISens<T> {
  actions: ActionsFromClassKeysIn<T>
  flows: ClassKeysAsFlow<KeysInClassesFrom<T>>
  state: KeysInClassesFrom<T>
  renew(): any
  newContext(context: any): LaSensType<T>
}
export declare function LaSens<T>(modules: T): ISens<T>
export {}
