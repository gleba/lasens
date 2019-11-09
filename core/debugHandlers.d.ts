export declare const safeModulePathHandler: ProxyHandler<any>;
export declare function proxyLoggerAction(context: any): {
    get(o: any, key: any): any;
};
export declare const makeMessageObj: (message: any) => {
    toString: () => any;
    [Symbol.toStringTag]: () => any;
    [Symbol.toPrimitive]: () => any;
};
export declare const alwaysErrorProxy: (message: any) => any;
export declare function proxyLoggerFlow(context: any): {
    get(o: any, key: any): any;
};
export declare function proxyLoggerDynamique(context: any): {
    get(o: any, key: any): any;
};
