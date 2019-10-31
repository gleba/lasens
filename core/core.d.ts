import { AFlow } from 'alak';
export declare type LaAction<T> = T extends {
    actions: (...args: any) => any;
} ? Omit<ReturnType<T['actions']>, 'new'> : any;
export declare type FromClass<T> = T extends new (...args: any) => any ? InstanceType<T> : never;
declare type ActionsModule<T> = LaAction<FromClass<T>>;
declare type StateModule<T> = Omit<FromClass<T>, 'actions'>;
declare type ActionModules<T> = {
    readonly [K in keyof T]: ActionsModule<T[K]>;
};
declare type StateModules<T> = {
    readonly [K in keyof T]: StateModule<T[K]>;
};
declare type FlowModule<T> = {
    readonly [K in keyof T]: AFlow<T[K]>;
};
declare type FlowModules<T> = {
    readonly [K in keyof T]: FlowModule<T[K]>;
};
export declare type LaSensType<T> = {
    actions: ActionModules<T>;
    flows: FlowModules<StateModules<T>>;
    state: StateModules<T>;
};
export declare const META_HOLISTIC = "holistic";
export declare const META_CLASSNAME = "classname";
export interface ISens<T> {
    actions: ActionModules<T>;
    flows: FlowModules<StateModules<T>>;
    renew(): any;
    newContext(context: any): LaSensType<T>;
}
export declare function LaSens<T>(modules: T): ISens<T>;
export {};
