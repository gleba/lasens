import { A, AFlow } from 'alak'
import { useCallback, useEffect, useState } from 'react'
import { alive } from '../core/utils'
import { ExtractClass } from '../core/core'
import { IDynamique } from '../core'

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
    console.warn('flow [', flow.id, '] - is not an asynchronous')
    return [state, false]
  }
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

type ApplyHookZ<T> = {
  (wrapValue: any): AFlow<T>
}
type ApplyHook<T> = { [K in keyof T]: ApplyHookZ<T[K]> }

type IDynamique4Hooks<T> = { [K in keyof T]: ApplyHook<ExtractClass<T[K]>> }

function makeDqFlowsProxyHandler() {
  const cache = {}
  function makeFlow(dqModule, flowName) {
    const proxyFlow = A()
    let connectedTarget
    proxyFlow.up(v => {
      if (connectedTarget && connectedTarget.value != v) {
        connectedTarget(v)
      }
    })
    return function(dinoId) {
      let target = dqModule(dinoId).flows[flowName]
      if (connectedTarget) connectedTarget.down(proxyFlow)
      connectedTarget = target
      target.up(proxyFlow)
      return proxyFlow
    }
  }
  return {
    get(dqModule, flowName) {
      let f = cache[flowName]
      if (!f) f = cache[flowName] = makeFlow(dqModule, flowName)
      return f
    },
  }
}

export function dynamiqueHooksConnector<T, A>(dynamique: IDynamique<T, A>): IDynamique4Hooks<T> {
  const dProxyHandler = {
    get(cache, className) {
      let m = cache[className]
      if (!m) m = cache[className] = new Proxy(dynamique[className], makeDqFlowsProxyHandler())
      return m
    },
  }
  return new Proxy({}, dProxyHandler)
}
