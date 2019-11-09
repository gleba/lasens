"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alak_1 = require("alak");
exports.safeModulePathHandler = {
    set(o, key, value) {
        o[key] = value;
        return true;
    },
    get(o, key) {
        let v = o[key];
        if (!v) {
            if (key == "toJSON") {
                return {
                    path: o._.moduleName,
                    class: o._.className,
                    flows: Object.keys(o)
                };
            }
            else {
                console.log(`× Not initialised flow: ${o._.moduleName}.${key}`);
                console.warn(`Use @qubit directive and processing null exception, or define value '${key}' in '${o._.className}'`);
                throw `GRAPH_SCHEMA_ERROR • ${o._.moduleName}.${key}`;
            }
        }
        return v;
    },
};
const ActionType = 'action';
const CreateType = 'create';
const RemoveType = 'remove';
function proxyLoggerAction(context) {
    const wrappedMap = {};
    const wrapper = modulePath => ({
        get(o, key) {
            return (...a) => {
                let uid = modulePath + '.' + key;
                alak_1.A.log({
                    type: ActionType,
                    context,
                    uid,
                    value: a,
                });
                return o[key](...a);
            };
        },
    });
    return {
        get(o, key) {
            let way = wrappedMap[key];
            if (!way) {
                way = wrappedMap[key] = new Proxy(o[key], wrapper(key));
            }
            return way;
        },
    };
}
exports.proxyLoggerAction = proxyLoggerAction;
const labelString = "∴ is lasens flow proxy ✓ in debug mode";
exports.makeMessageObj = message => ({
    toString: () => message,
    [Symbol.toStringTag]: () => message,
    [Symbol.toPrimitive]: () => message
});
exports.alwaysErrorProxy = message => {
    return new Proxy(exports.makeMessageObj(message), {
        get(o, key) {
            let m = o[key];
            if (m) {
                return m;
            }
            else {
                return exports.alwaysErrorProxy(message);
            }
        }
    });
};
function proxyLoggerFlow(context) {
    const wrappedMap = Object.assign({}, exports.makeMessageObj(labelString));
    const flowWrapper = {
        apply(o, thisArg, argumentsList) {
            argumentsList.push(...context);
            let v = argumentsList.shift();
            o(v, argumentsList);
        },
        get(o, key) {
            return o[key];
        },
    };
    const wrapper = moduleName => ({
        get(o, key) {
            let id = moduleName + '.' + key;
            let way = wrappedMap[id];
            if (!way)
                way = wrappedMap[id] = new Proxy(o[key], flowWrapper);
            return way;
        },
    });
    return {
        get(o, key) {
            let wrappedModule = wrappedMap[key];
            let originalModule = o[key];
            if (typeof originalModule != 'string') {
                if (!wrappedModule) {
                    wrappedModule = wrappedMap[key] = new Proxy(originalModule, wrapper(key));
                }
            }
            else {
                return exports.alwaysErrorProxy(originalModule);
            }
            return wrappedModule;
        }
    };
}
exports.proxyLoggerFlow = proxyLoggerFlow;
function proxyLoggerDynamique(context) {
    const logCreateModule = (o, a) => {
        let m = o(...a);
        alak_1.A.log({
            type: CreateType,
            context,
            uid: m.id,
            value: a,
        });
        return m;
    };
    const ways = {};
    const moduleHandler = {
        apply(o, _, a) {
            return logCreateModule(o, a);
        },
        get(o, key) {
            switch (key) {
                case "create":
                    return (...a) => logCreateModule(o, a);
                case "broadcast":
                    let m = ways[key];
                    if (!m) {
                        let x = o[key];
                        const { flows } = new Proxy({ flows: x.flows }, proxyLoggerFlow(["broadcast", ...context]));
                        const { actions } = new Proxy({ actions: x.actions }, proxyLoggerAction(["broadcast", ...context]));
                        m = ways[key] = {
                            flows,
                            actions
                        };
                    }
                    return m;
                case "removeById":
                    return (uid) => {
                        alak_1.A.log({
                            type: RemoveType,
                            context,
                            uid,
                        });
                        o[key](uid);
                    };
            }
            return o[key];
        }
    };
    const cachedModules = {};
    return {
        get(o, key) {
            let m = cachedModules[key];
            if (!m)
                m = cachedModules[key] = new Proxy(o[key], moduleHandler);
            return m;
        }
    };
}
exports.proxyLoggerDynamique = proxyLoggerDynamique;
