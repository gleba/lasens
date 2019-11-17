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


export function useComputeFlow<T, U>(flow: AFlow<T>, mixin:(v:T)=>U):[U] {
  let lastValue = flow.value
  let value = mixin(lastValue)
  const [state, mutate] = useState(value)
  let mutateFx = v => {
    if (lastValue !== v) {
      lastValue = v
      mutate(mixin(v))
    }
  }
  useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state]
}

export function useASyncFlow<T, U>(flow: AFlow<T>, mixin:(v:T)=>U):[U, Boolean] {
  const [state, mutate] = useState(flow.value)
  let busy
  if (flow.isAsync) {
    const [now, change] = useState(false)
    busy = { now, change }
  }
  useEffect(() => {
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
    console.warn('flow [',flow.id, '] - is not an asynchronous')
    return [state, false]
  }
}
//
