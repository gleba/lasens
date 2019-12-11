export declare function clearDecorators(): void
export declare const getter: (f: Function) => PropertyDecorator
export declare const lazyGetter: (f: Function) => PropertyDecorator
export declare const wrapper: (f: Function) => PropertyDecorator
export declare const changeFx: (f: Function) => PropertyDecorator
export declare const stored: (target: Object, propertyKey: string | symbol) => void
export declare const qubit: (target: Object, propertyKey: string | symbol) => void
export declare const holistic: (target: Object, propertyKey: string | symbol) => void
export declare function diamondMoment(instance: any, modulePath: any): any[]
export declare function wakeUp(arousal: any): void
