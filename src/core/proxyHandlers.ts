import {A} from "alak";

export const safeModulePathHandler = <ProxyHandler<any>>{
  set(o, key, value) {
    o[key] = value
    return true
  },
  get(o: any, key: string) {
    let v = o[key]
    if (!v) {
      console.log(key)
      console.log(`× Not initialised flow: ${o._.name}.${key}`)
      console.warn(
        `Use @qubit directive and processing null exception, or define value '${key}' in '${
          o._.className
        }'`,
      )
      throw `GRAPH_SCHEMA_ERROR • ${o._.name}.${key}`
    }
    return v
  },
}

const ActionType = 'action'
const CreateType = 'create'
const RemoveType = 'remove'

export function proxyLoggerAction(context) {
  const wrappedMap = {}
  const wrapper = modulePath => ({
    get(o, key) {
      return (...a) => {
        let uid = modulePath + '.' + key
        A.log({
          type: ActionType,
          context,
          uid,
          value: a,
        })
        return o[key](...a)
      }
    },
  })
  return {
    get(o, key) {
      let way = wrappedMap[key]
      if (!way) {
        way = wrappedMap[key] = new Proxy(o[key], wrapper(key))
      }
      return way
    },
  }
}

export function proxyLoggerFlow(context) {
  const wrappedMap = {}
  const flowWrapper = {
    apply(o, thisArg, argumentsList) {
      argumentsList.push(...context)
      let v = argumentsList.shift()
      o(v, argumentsList)
    },
    get(o, key) {
      return o[key]
    },
  }
  const wrapper = moduleName => ({
    get(o, key) {
      let id = moduleName + '.' + key
      let way = wrappedMap[id]
      if (!way) way = wrappedMap[id] = new Proxy(o[key], flowWrapper)
      return way
    },
  })
  return {
    get(o, key) {
      let element = wrappedMap[key]
      if (!element) {
        element = wrappedMap[key] = new Proxy(o[key], wrapper(key))
      }
      return element
    },
  }
}

export function proxyLoggerDynamique(context) {

  const logCreateModule = (o, a) => {
    let m = o(...a)
    A.log({
      type: CreateType,
      context,
      uid: m.id,
      value: a,
    })
    return m
  }
  const ways = {}
  const moduleHandler = {
    apply(o, _, a) {
      return logCreateModule(o, a)
    },
    get(o, key) {
      switch (key) {
        case "create":
          return (...a) => logCreateModule(o, a)
        case "broadcast":
          let m = ways[key]
          if (!m) {
            let x = o[key]
            const {flows} = new Proxy({flows:x.flows}, proxyLoggerFlow(["broadcast", ...context]))
            const {actions} = new Proxy({actions:x.actions}, proxyLoggerAction(["broadcast", ...context]))
            m = ways[key] = {
              flows,
              actions
            }
          }
          return m
        case "removeById":
          return (uid) => {
            A.log({
              type: RemoveType,
              context,
              uid,
            })
            o[key](uid)
          }
      }
      return o[key]
    }
  }
  const cachedModules = {}
  return {
    get(o, key) {
      let m = cachedModules[key]
      if (!m)
        m = cachedModules[key] = new Proxy(o[key], moduleHandler)
      return m
    }
  }
}
