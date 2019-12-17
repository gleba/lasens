import { A, AFlow } from 'alak'
import { useCallback, useEffect, useState } from 'react'
import { alive } from '../core/utils'

export { dynamiqueHooksConnector } from './dynamiqueHook'

export function useFlow<T>(flow: AFlow<T>): [T, AFlow<T>] {
  const [state, mutate] = useState(flow.value)
  useEffect(() => {
    flow.up(mutate)
    return () => flow.down(mutate)
  }, [flow])
  // if (state != value) mutate(value)
  return [state, useCallback(flow, [flow])]
}

export function useComputeFlow<T, U>(flow: AFlow<T>, computeFn: (v: T) => U): [U] {
  let lastValue = flow.value
  let value = computeFn(lastValue)
  const [state, mutate] = useState(value)
  let mutateFx = v => {
    if (lastValue !== v) {
      lastValue = v
      mutate(computeFn(v))
    }
  }
  useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state]
}

export function useFlowFx<T>(flow: AFlow<T>, effectFn: (v: T) => void): [T] {
  let lastValue = flow.value
  const [state, mutate] = alive(lastValue) ? useState(lastValue) : useState()
  let mutateFx = v => {
    if (lastValue !== v) {
      lastValue = v
      effectFn(v)
      mutate(v)
    }
  }
  useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state]
}

export function useASyncFlow<T, U>(flow: AFlow<T>, mixin?: (v: T) => U): [U, Boolean] {
  const [state, mutate] = alive(flow.value) ? useState(flow.value) : useState()
  // let busy
  // if (flow.isAsync) {
  const [now, change] = useState(false)
  // busy = { now, change }
  // }
  useEffect(() => {
    const mutator = v => state !== v && mutate(v)
    flow.up(mutator)
    flow.on.await(change)
    return () => {
      flow.down(mutator)
      flow.off.await(change)
    }
  }, [flow])
  return [state, now]
}

const asEventHandler = (e, value) => {
  // const [e, value] = a
  if (value != undefined) return value
  if (e.target) {
    if ('value' in e.target) return e.target.value
    if ('checked' in e.target) return e.target.checked
  }
  return ''
}

export function useInputFlow<T>(flow: AFlow<T>, effectFn?: (v: T) => void): [T, any] {
  let lastValue = flow.value
  const [state, mutate] = alive(lastValue) ? useState(lastValue) : useState()
  const mutateFx = v => {
    if (lastValue !== v) {
      if (flow.value != v) flow(v)
      lastValue = v
      if (effectFn) effectFn(v)
      mutate(v)
    }
  }
  // @ts-ignore
  const eventHandler = (...a) => mutateFx(asEventHandler(...a))
  useEffect(() => {
    flow.up(mutateFx)
    return () => flow.down(mutateFx)
  }, [flow])
  return [state, eventHandler]
}

export function useOnFlow<T>(flow: AFlow<T>, listingFn: (v: T) => void, ...diff: any[]): void {
  useEffect(() => {
    flow.up(listingFn)
    return () => flow.down(listingFn)
  }, [flow, ...diff])
}
