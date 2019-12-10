import { AFlow } from 'alak'
import { ExtractClass } from '../core/core'
import { IDynamique } from '../core'
export declare function useFlow<T>(flow: AFlow<T>): [T, AFlow<T>]
export declare function useComputeFlow<T, U>(flow: AFlow<T>, computeFn: (v: T) => U): [U]
export declare function useFlowFx<T>(flow: AFlow<T>, effectFn: (v: T) => void): [T]
export declare function useASyncFlow<T, U>(flow: AFlow<T>, mixin?: (v: T) => U): [U, Boolean]
export declare function useInputFlow<T>(flow: AFlow<T>, effectFn?: (v: T) => void): [T, any]
export declare function useOnFlow<T>(
  flow: AFlow<T>,
  listingFn: (v: T) => void,
  ...diff: any[]
): void
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
