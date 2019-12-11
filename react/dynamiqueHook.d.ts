import { AFlow } from 'alak'
import { ExtractClass } from '../core/core'
import { IDynamique } from '../core'
declare type ApplyHookZ<T> = {
  (wrapValue: any): AFlow<T>
}
declare type ApplyHook<T> = {
  [K in keyof T]: ApplyHookZ<T[K]>
}
declare type IDynamique4Hooks<T> = {
  [K in keyof T]: ApplyHook<ExtractClass<T[K]>>
}
export declare function dynamiqueHooksConnector<T, A>(store: IDynamique<T, A>): IDynamique4Hooks<A>
export {}
