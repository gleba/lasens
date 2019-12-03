"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alak_1 = require("alak");
const decor_1 = require("./decor");
const utils_1 = require("./utils");
const debugHandlers_1 = require("./debugHandlers");
const stateProxyHandler_1 = require("./stateProxyHandler");
exports.META_HOLISTIC = 'holistic';
exports.META_CLASSNAME = 'classname';
function LaSens(modules) {
    const availableModules = () => "available modules: " + Object.keys(sleepingModules).toString();
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
                let reasonToSleep = awakeModule(key);
                if (!reasonToSleep) {
                    m = o[key];
                }
                else if (utils_1.primitiveExceptions[key]) {
                    return reasonToSleep;
                }
                else {
                    let reasonExplain = "[" + key + "] is unavailable module, available path: " + reasonToSleep.toString();
                    return alak_1.default.canLog ? reasonExplain : debugHandlers_1.alwaysErrorProxy(reasonExplain);
                }
            }
            return m;
        },
    };
    const flows = new Proxy(awakedFlow, graphProxyHandler);
    const actions = new Proxy(awakedActions, graphProxyHandler);
    const state = new Proxy(flows, stateProxyHandler_1.stateProxyHandler());
    const things = {
        flows: [flows, debugHandlers_1.proxyLoggerFlow],
        actions: [actions, debugHandlers_1.proxyLoggerAction],
        state
    };
    function makeSenseFor(context) {
        let result = { state };
        ['flows', 'actions'].forEach(k => {
            let [thing, proxyH] = things[k];
            if (alak_1.default.canLog) {
                result[k] = new Proxy(thing, proxyH(context));
            }
            else {
                result[k] = thing;
            }
        });
        return result;
    }
    // const state = new Proxy(awakedActions, graphProxyHandler) as ActionModules<T>
    function awakeModule(modulePath) {
        if (utils_1.primitiveExceptions[modulePath]) {
            return debugHandlers_1.alwaysErrorProxy(availableModules());
        }
        let sleepingModule = sleepingModules[modulePath];
        if (!sleepingModule) {
            console.error('Module by path name: [', modulePath, '] is not found');
            let availableModulesMessage = availableModules();
            console.warn(availableModulesMessage);
            return debugHandlers_1.alwaysErrorProxy(availableModulesMessage);
        }
        console.log('✓ awake module :', modulePath);
        let awakened = new sleepingModule();
        let className = awakened.constructor.name;
        let holistic = decor_1.holisticLive(awakened, className);
        let module = new Proxy({ _: { moduleName: modulePath, className } }, debugHandlers_1.safeModulePathHandler);
        Object.keys(awakened).forEach(flowName => {
            let flow = alak_1.default();
            let initialFlowStateValue = awakened[flowName];
            let isHolistic = holistic[flowName];
            let isAliveValue = utils_1.alive(initialFlowStateValue);
            if (isHolistic) {
                flow.addMeta(exports.META_HOLISTIC, initialFlowStateValue);
            }
            flow.setName(flowName);
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
            let thingsInContext = makeSenseFor([className, modulePath, ...utils_1.DEBUG_MODULE]);
            let f = thingsInContext.flows[modulePath];
            awakened.actions.bind(thingsInContext);
            awakedActions[modulePath] = awakened.actions.apply(thingsInContext, [Object.assign({ f }, thingsInContext), thingsInContext]);
        }
        return false;
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
        things, newContext: makeSenseFor }, makeSenseFor(utils_1.DEBUG_FACADE));
}
exports.LaSens = LaSens;
