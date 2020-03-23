import A, { IAtom } from 'alak'
import { ExtractClass, META_MODULE_PATH } from '../core/core'
import { IDynamique } from '../core'

type ApplyHookZ<T> = {
  (wrapValue: any): IAtom<T>
}
type ApplyHook<T> = { [K in keyof T]: ApplyHookZ<T[K]> }

type IDynamique4Hooks<T> = { [K in keyof T]: ApplyHook<ExtractClass<T[K]>> }

function makeDqFlowsProxyHandler() {
  const cache = {}
  const activeMap = {}
  const setActive = (flow: IAtom<any>, v) => {
    let modulePath = flow.getMeta(META_MODULE_PATH)
    if (!activeMap[modulePath]) {
      activeMap[modulePath] = { [flow.name]: v }
    } else {
      activeMap[modulePath][flow.name] = v
    }
  }
  const timeoutMap = {}
  function clearUsage(flow: IAtom<any>, clearFn) {
    let modulePath = flow.getMeta(META_MODULE_PATH)
    if (timeoutMap[modulePath]) return
    const checkFn = () => {
      let o = activeMap[modulePath]
      return Object.keys(o).every(k => !o[k])
    }
    if (checkFn()) {
      timeoutMap[modulePath] && clearTimeout(timeoutMap[modulePath])
      timeoutMap[modulePath] = setTimeout(() => {
        if (checkFn()) {
          delete cache[flow.name]
          delete activeMap[modulePath]
          clearFn()
        }
      }, 5000)
    }
  }
  function makeFlow(dqModule, flowName) {
    let connectedTarget: IAtom<any>
    let proxyFlow = cache[flowName]
    if (!proxyFlow) {
      proxyFlow = cache[flowName] = A()
      proxyFlow.up(v => {
        if (connectedTarget && connectedTarget.value != v) {
          connectedTarget(v)
        }
      })
    }

    return function(argForD) {
      let dqm = dqModule(argForD ? argForD : '-_-')
      let target: IAtom<any> = dqm.flows[flowName]
      if (connectedTarget && connectedTarget.id != target.id) {
        connectedTarget.down(proxyFlow)
      }
      connectedTarget = target
      if (proxyFlow.id != target.id) {
        target.up(proxyFlow)
        if (target.isEmpty && !proxyFlow.isEmpty) {
          proxyFlow(undefined)
        }
      }
      proxyFlow.setId(target.id)
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

export function dynamiqueHooksConnector<T, A>(store: IDynamique<T, A>): IDynamique4Hooks<A> {
  const dProxyHandler = {
    get(cache, className) {
      let m = cache[className]
      if (!m)
        m = cache[className] = new Proxy(store.dynamique[className], makeDqFlowsProxyHandler())
      return m
    },
  }
  return new Proxy({}, dProxyHandler)
}
