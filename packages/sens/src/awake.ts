import { IBox, IWay, newRune } from './index'
import { A } from 'alak'
import {
  domainActions,
  domainAtoms,
  domainLink,
  registerBodyDomain,
} from './domain'
import { decorate } from './decor'

const systemFields = {
  _start: true as any,
  _decay: true as any,
  _private: true as any,
  _holistic: true as any,
  body: true as any,
}

export function awake(box: IBox) {
  box.isSleep = false
  const { way } = box
  delete box.wakeUp
  return getup(way)
}

export function getup(way: IWay, id?, target?) {
  const domain = id ? way.domain + '.' + id : way.domain
  const uid = newRune(7)
  id = id || uid
  const { _holistic, proxyAtoms, actions, propDesk, children } = getSens(
    way.thing,
    domain
  )

  const ctxPublic = {
    id,
    uid,
    domain,
  } as any
  if (target) ctxPublic.target = target

  const privateAtoms = way.privateThings
    ? getSens(way.privateThings, `${domain}.private`).atoms
    : {}
  const deepAtoms = new Proxy(
    {
      proxy: proxyAtoms,
      deep: children.atoms,
      think: privateAtoms,
    },
    thinkDeepProxy
  )

  const deepCtx = {
    $: deepAtoms,
    _: _holistic,
  }

  const thisBodyCtx = Object.assign({}, deepCtx)
  Object.keys(ctxPublic).forEach(k => {
    thisBodyCtx[`$${k}`] = ctxPublic[k]
  })
  const publicAction = way.publicAction
    ? getSens(way.publicAction, `${domain}.public`).actions
    : {}

  const bodyActions: any = makeBodyAction(
    thisBodyCtx,
    deepAtoms,
    Object.assign(actions, publicAction),
    propDesk
  )
  const { _start } = bodyActions
  _start && _start({ ...ctxPublic, ...deepCtx })

  if (way.constructor) {
    const lasActions = way.constructor(
      new Proxy(
        { think: ctxPublic, deep: bodyActions, proxy: deepAtoms },
        thinkDeepProxy
      )
    )
    lasActions && Object.assign(bodyActions, lasActions)
  }

  return new Proxy(
    {
      think: { _: _holistic, $: ctxPublic },
      deep: bodyActions,
      proxy: proxyAtoms,
    },
    thinkDeepProxy
  )
}

function makeBodyAction(ctx, atoms, actions, desk) {
  const body = {}
  const proxy = new Proxy({ ctx, body, atoms }, bodyActionProxyHandlers)
  actions &&
    Object.keys(actions).forEach(key => {
      // console.log('::', key)
      body[key] = actions[key].bind(proxy)
    })
  desk &&
    Object.keys(desk).forEach(key => {
      let dp = desk[key]
      Object.defineProperty(body, key, {
        get: dp.get && dp.get.bind(proxy),
        set: dp.set && dp.set.bind(proxy),
      } as any)
    })
  return body
}

export const addAtom = (key, body: any, domain?, value?) => {
  if (systemFields[key]) throw 'system field in atom'
  const atom = value ? A(value) : A()
  atom.setId(domain + '.' + key)
  atom.setName(key)
  body[key] = atom
  return atom
}
// function privateSens(instance, domain) {
//   const atoms = {}
//   let sens
//   if (typeof instance === 'function') {
//     sens = new instance()
//   } else {
//     sens = instance
//   }
//   let privateDomain = `${domain}.private`
//   Object.keys(sens).forEach(key =>
//     addAtom(key, atoms, privateDomain, sens[key])
//   )
//   return atoms
// }

// const NaF = f => typeof f === 'function'

function getSens(thing: any, domain) {
  const atoms = {},
    propDesk = {} as KV<PropertyDescriptor>,
    actions = {}
  let instance,
    isClass = false

  if (typeof thing === 'function') {
    instance = new thing()
    isClass = true
    let protoOfInstance = Object.getPrototypeOf(instance)
    let methods = Object.getOwnPropertyNames(protoOfInstance)
    methods.shift()
    methods.forEach(key => {
      let opd = Object.getOwnPropertyDescriptor(protoOfInstance, key)
      if (opd.get || opd.set) {
        propDesk[key] = opd
      } else {
        actions[key] = opd.get ? () => opd.get() : instance[key]
      }
    })
    Object.keys(instance).forEach(
      key => !systemFields[key] && addAtom(key, atoms, domain, instance[key])
    )
  } else {
    instance = thing
    Object.keys(thing).forEach(key => {
      let value = thing[key]
      if (typeof value === 'function') actions[key] = value
      else addAtom(key, atoms, domain, value)
    })
  }
  const { _private } = instance

  // privateAtoms = privateSens(_private, domain)
  // const publicAtoms = new Proxy({atoms, domain}, atomsProxyHandler)
  // havePublicClass && decorate(publicAtoms, instance)
  // havePrivateClass && decorate(privateAtoms, _private)
  const children = _private ? getSens(_private, `${domain}.private`) : null
  const proxyAtoms = new Proxy(
    { atoms, protect: children?.atoms, domain },
    atomsProxyHandler
  )
  isClass && decorate(proxyAtoms, instance)

  return {
    _holistic: instance._holistic || {},
    proxyAtoms,
    atoms,
    actions,
    propDesk,
    children,
  }
}

const publicProxyHandlers = {
  get({ body, atoms }, key) {
    // console.log("public call", key)
    return body[key] || atoms[key]
  },
}
const bodyActionProxyHandlers = {
  get({ ctx, body, atoms }, key) {
    const v = ctx[key] || body[key]
    if (v) return v
    return atoms[key]
  },
  set({ ctx, body, atoms }, key, value) {
    const a = body[key] || atoms[key]
    a(value)
    return true
  },
}
const thinkDeepProxy = {
  get({ proxy, deep, think }, key) {
    // console.log({ proxy, deep, think })
    return think[key] || deep[key] || proxy[key]
  },
}

const atomsProxyHandler = {
  get({ atoms, protect, domain }, key) {
    if (protect && protect[key]) {
      throw 'violation of the private area'
    }
    return atoms[key] || addAtom(key, atoms, domain)
  },
}
