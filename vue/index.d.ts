import { ISens } from "../core";
import { AFlow } from "alak";
declare type LaVueAFlow<T> = AFlow<T> & {
    as: (nameInTemplate: string, wrapper?: (v: T) => any) => LaVueAFlow<T>;
    asIs: (wrapper?: (v: T) => any) => LaVueAFlow<T>;
};
declare type FlowModule<T> = {
    readonly [K in keyof T]: LaVueAFlow<T[K]>;
};
declare type FlowModules<T> = {
    readonly [K in keyof T]: FlowModule<T[K]>;
};
declare type StateModule<T extends ISens<any>> = T['flows'];
export interface LaVueCO<T extends ISens<any>> {
    (sens: FlowModules<StateModule<T>>): any;
}
export declare function LaVue<T>(sens: ISens<T>): {
    install(_Vue: any, options: any, ...a: any[]): void;
};
export {};
