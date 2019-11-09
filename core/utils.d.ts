import { AFlow } from 'alak';
export interface Obj<V> {
    [s: string]: V;
}
export declare const extractEventTarget: <T>(f: AFlow<T>) => (e: any) => T | Promise<T>;
export declare const alive: (v: any) => boolean;
export declare const isTruth: (v: any) => boolean;
export declare const nullFilter: (f: any) => (v: any) => any;
export declare const eTargetValue: (f: any, clearError?: Function) => (e: any) => void;
export declare const onEnter: (f: Function) => (e: any) => void;
export declare const toDicById: (list: any) => {};
export declare function flatFlowObject(o: Obj<AFlow<any>>): Obj<any>;
export declare const primitiveExceptions: {
    toString: boolean;
    [Symbol.toStringTag]: boolean;
    [Symbol.toPrimitive]: boolean;
};
export declare const clearObject: (o: any) => void;
export declare const DEBUG_LA_SENS = "lasens";
export declare const DEBUG_INIT_FLOW: string[];
export declare const DEBUG_FACADE: string[];
export declare const DEBUG_MODULE: string[];
export declare const DEBUG_VIEW: string[];
export declare const DEBUG_DYN_MODULE: string[];
