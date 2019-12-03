"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateProxyHandler = () => {
    const cached = {};
    const flowHandler = {
        get(o, key) {
            if (o[key])
                return o[key].value;
            else
                throw "empty flow " + key + " for pure state getter";
        },
    };
    return {
        get(o, key) {
            if (cached[key]) {
                return cached[key];
            }
            else {
                return (cached[key] = new Proxy(o[key], flowHandler));
            }
        },
    };
};
