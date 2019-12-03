import { AFlow } from 'alak'
export declare function useFlow<T>(flow: AFlow<T>): [T, AFlow<T>]
export declare function useComputeFlow<T, U>(flow: AFlow<T>, computeFn: (v: T) => U): [U]
export declare function useFlowFx<T>(flow: AFlow<T>, effectFn: (v: T) => void): [T]
export declare function useASyncFlow<T, U>(flow: AFlow<T>, mixin?: (v: T) => U): [U, Boolean]
export declare function useInputFlow<T>(
  flow: AFlow<T>,
  effectFn?: (v: T) => void,
): [
  T,
  (e: {
    target: {
      value?: any
      checked?: any
    }
  }) => void,
]
export declare function useOnFlow<T>(
  flow: AFlow<T>,
  listingFn: (v: T) => void,
  ...diff: any[]
): void
