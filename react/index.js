'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const react_1 = require('react')
function useFlow(flow) {
  const [state, mutate] = react_1.useState(flow.value)
  react_1.useEffect(() => {
    flow.up(mutate)
    return () => flow.down(mutate)
  }, [flow])
  // if (state != value) mutate(value)
  return [state, react_1.useCallback(flow, [flow])]
}
exports.useFlow = useFlow
function useComputeFlow(flow, computeFn) {
  let lastValue = flow.value
  let value = computeFn(lastValue)
  const [state, mutate] = react_1.useState(value)
  let mutateFx = v => {
    if (lastValue !== v) {
      lastValue = v
      mutate(computeFn(v))
    }
  }
  react_1.useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state]
}
exports.useComputeFlow = useComputeFlow
function useFlowFx(flow, effectFn) {
  let lastValue = flow.value
  const [state, mutate] = react_1.useState(flow.value)
  let mutateFx = v => {
    if (lastValue !== v) {
      lastValue = v
      effectFn(v)
      mutate(v)
    }
  }
  react_1.useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state]
}
exports.useFlowFx = useFlowFx
function useASyncFlow(flow, mixin) {
  const [state, mutate] = react_1.useState(flow.value)
  let busy
  if (flow.isAsync) {
    const [now, change] = react_1.useState(false)
    busy = { now, change }
  }
  react_1.useEffect(() => {
    const mutator = v => state !== v && mutate(v)
    flow.up(mutator)
    if (busy) flow.on.await(busy.change)
    return () => {
      flow.down(mutator)
      if (busy) flow.off.await(busy.change)
    }
  }, [flow])
  if (busy) return [state, busy.now]
  else {
    console.warn('flow [', flow.id, '] - is not an asynchronous')
    return [state, false]
  }
}
exports.useASyncFlow = useASyncFlow
const asEventHandler = (e, value) => {
  if (value != undefined) return value
  if (e.target) {
    if ('value' in e.target) return e.target.value
    if ('checked' in e.target) return e.target.checked
  }
  return ''
}
function useInputFlow(flow, effectFn) {
  let lastValue = flow.value
  const [state, mutate] = react_1.useState(flow.value)
  const mutateFx = v => {
    if (lastValue !== v) {
      if (flow.value != v) flow(v)
      lastValue = v
      if (effectFn) effectFn(v)
      mutate(v)
    }
  }
  const eventHandler = (...a) => mutateFx(asEventHandler(...a))
  react_1.useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state, eventHandler]
}
exports.useInputFlow = useInputFlow
function useOnFlow(flow, listingFn, ...diff) {
  react_1.useEffect(() => {
    flow.up(listingFn)
    return () => flow.down(listingFn)
  }, [flow, ...diff])
}
exports.useOnFlow = useOnFlow
