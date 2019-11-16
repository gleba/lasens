"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const localstore_1 = require("./localstore");
var Decor;
(function (Decor) {
    Decor["Getter"] = "getter";
    Decor["Change"] = "change";
    Decor["Stored"] = "stored";
})(Decor || (Decor = {}));
const decorModuleMap = {};
const holisticFlowMap = {};
const qubitFlowMap = {};
function clearDecorators() {
    utils_1.clearObject(delay);
}
exports.clearDecorators = clearDecorators;
const upGet = (o, key) => {
    let v = o[key];
    if (!v)
        v = o[key] = {};
    return v;
};
const addMetaMap = (mutator, module, key, fx) => {
    upGet(upGet(decorModuleMap, module), key)[mutator] = fx;
};
function getter(f) {
    return (target, propertyKey) => {
        addMetaMap(Decor.Getter, target.constructor.name, propertyKey, f);
    };
}
exports.getter = getter;
function changeFx(f) {
    return (target, propertyKey) => {
        addMetaMap(Decor.Change, target.constructor.name, propertyKey, f);
    };
}
exports.changeFx = changeFx;
function stored(target, propertyKey) {
    addMetaMap(Decor.Stored, target.constructor.name, propertyKey, true);
}
exports.stored = stored;
function qubit(target, propertyKey) {
    upGet(qubitFlowMap, target.constructor.name)[propertyKey] = true;
}
exports.qubit = qubit;
function holistic(target, propertyKey) {
    upGet(holisticFlowMap, target.constructor.name)[propertyKey] = true;
}
exports.holistic = holistic;
function extra(target, propertyKey) {
    // return {
    //   xx :{
    //     aa:'ok'
    //   }
    // }
}
exports.extra = extra;
function holisticLive(module, className) {
    let holisticFlow = holisticFlowMap[className];
    let qubitFlow = qubitFlowMap[className];
    let holistic = {};
    if (qubitFlow)
        Object.keys(qubitFlow).forEach(n => {
            if (!utils_1.alive(module[n]))
                module[n] = null;
        });
    if (holisticFlow)
        Object.keys(holisticFlow).forEach(n => {
            if (!utils_1.alive(module[n]))
                module[n] = null;
            holistic[n] = true;
        });
    return holistic;
}
exports.holisticLive = holisticLive;
function applyDecors(flow, moduleName, flowName) {
    let decorMap = decorModuleMap[moduleName];
    if (decorMap) {
        let decors = decorMap[flowName];
        if (decors) {
            warmUp(flow, decors);
        }
    }
}
exports.applyDecors = applyDecors;
const delay = [];
function warmUp(flow, decors) {
    let delayed = {};
    Object.keys(decors).forEach(v => {
        let decor = decors[v];
        switch (v) {
            case Decor.Stored:
                localstore_1.XStorage.bindFlow(flow);
                break;
            default:
                delayed[v] = decor;
        }
    });
    if (Object.keys(delayed).length) {
        delay.push([flow, delayed]);
    }
}
function wakeUp() {
    delay.forEach(([flow, decors]) => {
        Object.keys(decors).forEach(v => {
            let decor = decors[v];
            switch (v) {
                case Decor.Getter:
                    flow.useWarp(decor);
                    flow();
                    break;
                case Decor.Change:
                    flow.up(decor);
                    break;
            }
        });
    });
    delay.length = 0;
}
exports.wakeUp = wakeUp;
