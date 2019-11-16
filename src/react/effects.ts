import { A, AFlow } from 'alak'
import { useCallback, useEffect, useState } from 'react'


export function useFlow<T>(flow: AFlow<T>):[T, AFlow<T>] {
  const [state, mutate] = useState(flow.value)
  useEffect(() => {
    flow.up(mutate)
    return () => flow.down(mutate)
  }, [flow])
  // if (state != value) mutate(value)
  return [state, useCallback(flow, [flow])]
}

// function useBusy(flowId: string): [T, boolean?] {
//   const [value, flow] = holy(flowId)
//   const [state, mutate] = useState(value)
//   let busy
//   if (flow.isAsync) {
//     const [now, change] = useState(false)
//     busy = { now, change }
//   }
//   useEffect(() => {
//     const mutator = v => state !== v && mutate(v)
//     flow.up(mutator)
//     if (busy) flow.on.await(busy.change)
//     return () => {
//       flow.down(mutator)
//       if (busy) flow.off.await(busy.change)
//     }
//   }, [storeId])
//   if (busy) return [state, busy.now]
//   else {
//     console.warn(flow.id, '- is not asynchronously born')
//     return [state]
//   }
// }
//
// function useComputeFlow(flowId, { mixin }) {
//   let [lastValue, flow] = holy(flowId)
//   let value = mixin(lastValue)
//   const [state, mutate] = useState(value)
//   let mutateFx = v => {
//     if (lastValue !== v) {
//       lastValue = v
//       mutate(mixin(v))
//     }
//   }
//   useEffect(() => {
//     flow.up(mutateFx)
//     return () => flow.down(mutateFx)
//   }, [storeId])
//   return [state]
// }
//
// function useFlowCompute(mixin) {
//   let safeContext = graphPathFinder('computed', f => {
//     mixin.bind(safeContext)
//     return useComputeFlow(f, safeContext)
//   })
//   safeContext.mixin = mixin
//   return safeContext
// }
