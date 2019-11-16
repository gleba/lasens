import { AFlow } from 'alak';
export declare function useFlow<T>(flow: AFlow<T>): [T, AFlow<T>];
export declare function useComputeFlow<T, U>(flow: AFlow<T>, mixin: (v: T) => U): [U];
export declare function useASyncFlow<T, U>(flow: AFlow<T>, mixin: (v: T) => U): [U, Boolean];
