"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEventTarget = (f) => (e) => f(e.target.value);
exports.alive = v => (v !== undefined && v !== null);
exports.isTruth = v => !!v;
exports.nullFilter = f => v => (exports.alive(v) ? f(v) : null);
exports.eTargetValue = (f, clearError) => e => {
    f(e.target.value);
    if (clearError) {
        clearError(false);
    }
};
exports.onEnter = (f) => e => {
    if (e.key === 'Enter') {
        f();
        e.preventDefault();
    }
};
exports.toDicById = list => {
    let o = {};
    if (list)
        list.forEach(n => {
            o[n.id] = n;
        });
    return o;
};
function flatFlowObject(o) {
    let n = {};
    Object.keys(o).forEach(k => {
        n[k] = o[k].value;
    });
    return n;
}
exports.flatFlowObject = flatFlowObject;
exports.primitiveExceptions = {
    toString: true,
    [Symbol.toStringTag]: true,
    [Symbol.toPrimitive]: true
};
exports.clearObject = o => {
    Object.keys(o).forEach(n => {
        if (!exports.primitiveExceptions[n])
            delete o[n];
    });
};
exports.DEBUG_LA_SENS = "lasens";
exports.DEBUG_INIT_FLOW = ["init", exports.DEBUG_LA_SENS];
exports.DEBUG_FACADE = ["facade", exports.DEBUG_LA_SENS];
exports.DEBUG_MODULE = ["module", exports.DEBUG_LA_SENS];
exports.DEBUG_VIEW = ["view", exports.DEBUG_LA_SENS];
exports.DEBUG_DYN_MODULE = ["dyn_module", exports.DEBUG_LA_SENS];
