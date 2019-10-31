"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alak_1 = require("alak");
const decor_1 = require("./decor");
const utils_1 = require("./utils");
const proxyHandlers_1 = require("./proxyHandlers");
exports.META_HOLISTIC = 'holistic';
exports.META_CLASSNAME = 'classname';
function LaSens(modules) {
    const sleepingModules = {};
    let awakedFlow = {};
    let awakedActions = {};
    let flowMap = {};
    let usedWays = {};
    let storeId = 0;
    const graphProxyHandler = {
        get(o, key) {
            let m = o[key];
            if (!m) {
                awakeModule(key);
                m = o[key];
            }
            return m;
        },
    };
    const flows = new Proxy(awakedFlow, graphProxyHandler);
    const actions = new Proxy(awakedActions, graphProxyHandler);
    const things = {
        flows: [flows, proxyHandlers_1.proxyLoggerFlow],
        actions: [actions, proxyHandlers_1.proxyLoggerAction]
    };
    function useThingsFor(context) {
        let result = {};
        Object.keys(things).forEach(k => {
            let [thing, proxyH] = things[k];
            result[k] = alak_1.default.canLog ? new Proxy(thing, proxyH(context)) : thing;
        });
        return result;
    }
    // const state = new Proxy(awakedActions, graphProxyHandler) as ActionModules<T>
    function awakeModule(modulePath) {
        console.log('✓ awake module :', modulePath);
        let sleepingModule = sleepingModules[modulePath];
        if (!sleepingModule) {
            console.error('Module Name: ', modulePath, ' is not initialised');
        }
        let awakened = new sleepingModule();
        let className = awakened.constructor.name;
        let holistic = decor_1.holisticLive(awakened, className);
        let module = new Proxy({ _: { moduleName: modulePath, className } }, proxyHandlers_1.safeModulePathHandler);
        Object.keys(awakened).forEach(flowName => {
            let flow = alak_1.default();
            let initialFlowStateValue = awakened[flowName];
            let isHolistic = holistic[flowName];
            let isAliveValue = utils_1.alive(initialFlowStateValue);
            if (isHolistic) {
                flow.addMeta(exports.META_HOLISTIC, initialFlowStateValue);
            }
            flow.setId(modulePath + '.' + flowName);
            flow.addMeta(exports.META_CLASSNAME, className);
            if (isAliveValue && !isHolistic) {
                flow(initialFlowStateValue, utils_1.DEBUG_INIT_FLOW);
            }
            decor_1.applyDecors(flow, className, flowName);
            module[flowName] = flow;
            flowMap[flow.id] = flow;
        });
        awakedFlow[modulePath] = module;
        decor_1.wakeUp();
        if (awakened.actions) {
            let ctxedThinx = useThingsFor([className, modulePath, ...utils_1.DEBUG_MODULE]);
            let f = ctxedThinx.flows[modulePath];
            awakened.actions.bind(ctxedThinx);
            awakedActions[modulePath] = awakened.actions.apply(ctxedThinx, [Object.assign({ f }, ctxedThinx), ctxedThinx]);
        }
        return module;
    }
    function renew() {
        utils_1.clearObject(awakedActions);
        utils_1.clearObject(awakedFlow);
        utils_1.clearObject(usedWays);
        utils_1.clearObject(sleepingModules);
        storeId++;
        for (let moduleName in modules) {
            sleepingModules[moduleName] = modules[moduleName];
        }
    }
    return Object.assign({ renew,
        things, newContext: useThingsFor }, useThingsFor(utils_1.DEBUG_FACADE));
}
exports.LaSens = LaSens;
