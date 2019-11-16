"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
function checkMeta(flow) {
}
function useFlow(flow) {
    const [state, mutate] = react_1.useState(flow.value);
    react_1.useEffect(() => {
        flow.up(mutate);
        return () => flow.down(mutate);
    }, [flow]);
    // if (state != value) mutate(value)
    return [state, react_1.useCallback(flow, [flow])];
}
exports.useFlow = useFlow;
function useComputeFlow(flow, mixin) {
    let lastValue = flow.value;
    let value = mixin(lastValue);
    const [state, mutate] = react_1.useState(value);
    let mutateFx = v => {
        if (lastValue !== v) {
            lastValue = v;
            mutate(mixin(v));
        }
    };
    react_1.useEffect(() => {
        flow.up(mutateFx);
        return () => flow.down(mutateFx);
    }, [flow]);
    return [state];
}
exports.useComputeFlow = useComputeFlow;
function useASyncFlow(flow, mixin) {
    const [state, mutate] = react_1.useState(flow.value);
    let busy;
    if (flow.isAsync) {
        const [now, change] = react_1.useState(false);
        busy = { now, change };
    }
    react_1.useEffect(() => {
        const mutator = v => state !== v && mutate(v);
        flow.up(mutator);
        if (busy)
            flow.on.await(busy.change);
        return () => {
            flow.down(mutator);
            if (busy)
                flow.off.await(busy.change);
        };
    }, [flow]);
    if (busy)
        return [state, busy.now];
    else {
        console.warn('flow [', flow.id, '] - is not an asynchronous');
        return [state, false];
    }
}
exports.useASyncFlow = useASyncFlow;
//
