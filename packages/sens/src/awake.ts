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

export function getup(way, id?, target?) {
  const domain = id ? way.domain + '.' + id : way.domain
  const { thing } = way
  const {
    atoms,
    actions,
    propDesk,
    _holistic,
    privateAtoms,
    isClass
  } = getSens(thing, domain)
  const publicProxyAtoms = new Proxy({ atoms, domain }, atomsProxyHandler)
  isClass && decorate(publicProxyAtoms, thing)
  const uid = newRune(7)
  id = id || uid
  const privateProxyAtoms = new Proxy({atoms: privateAtoms, domain}, atomsProxyHandler)

  const ctxPublic = {
    id,
    uid,
    domain
  } as any
  if (target) ctxPublic.target = target
  const ctxPrivate = {
    $:publicProxyAtoms,
    _:privateProxyAtoms,
    _holistic,
  }
  const $ctx = {...ctxPrivate}
  Object.keys(ctxPublic).forEach(k=>{
    $ctx[`$${k}`] = ctxPublic[k]
  })
  const bodyActions:any = makeBodyAction($ctx, publicProxyAtoms, actions, propDesk)
  const { _start } = bodyActions
  _start && _start({...ctxPublic, ...ctxPrivate})

  return new Proxy({ body:{
    ...bodyActions,
    $:{
      _holistic,
      ...ctxPublic},

    }, atoms:publicProxyAtoms }, publicProxyHandlers)
}

function makeBodyAction(ctx, proxyAtoms, actions, desk) {
  const body = {}
  const proxy = new Proxy({ ctx, body, atoms:proxyAtoms }, bodyActionProxyHandlers)
  actions &&
    Object.keys(actions).forEach(key => {
      // console.log("::", key)
      body[key] = actions[key].bind(proxy)
    })
  desk && Object.keys(desk).forEach(key=>{
    let dp = desk[key]
    Object.defineProperty(body, key, {
      get:dp.get && dp.get.bind(proxy),
      set:dp.set && dp.set.bind(proxy),
    } as any)
  })
  return body
}

export const addAtom = (key, body: any, domain?, value?) => {
  if (systemFields[key]) throw "system field in atom"
  const atom = value ? A(value) : A()
  atom.setId(domain + '.' + key)
  atom.setName(key)
  body[key] = atom
  return atom
}
function privateSens(instance,domain) {
  const atoms = {}
  const { _private } = instance
  if (_private) {
    let privateDomain = `${domain}.private`
    Object.keys(_private).forEach(key =>
      addAtom(key, atoms, domain, _private[key])
    )
    delete instance._private
  }
  return atoms
}
const NaF = f => typeof f === 'function'


function getSens(thing: any, domain) {
  const
    atoms = {},
    propDesk = {} as KV<PropertyDescriptor>,
    actions = {}
  let instance, privateAtoms
  let isClass = false

  if (typeof thing === 'function') {
    instance = new thing()
    isClass = true
    privateAtoms = privateSens(instance, domain)
    let protoOfInstance = Object.getPrototypeOf(instance)
    let methods = Object.getOwnPropertyNames(protoOfInstance)
    methods.shift()
    methods.forEach(key => {
      let opd = Object.getOwnPropertyDescriptor(protoOfInstance, key)
      if (opd.get || opd.set) {
        propDesk[key] = opd
      } else {
        actions[key] = opd.get ? ()=>opd.get() : instance[key]
      }
    })
    Object.keys(instance).forEach(key =>
      !systemFields[key] && addAtom(key, atoms, domain, instance[key])
    )
  } else {
    instance = thing
    privateAtoms = privateSens(thing, domain)
    Object.keys(thing).forEach(key => {
      let value = thing[key]
      if (typeof value === 'function') actions[key] = value
      else addAtom(key, atoms, domain, value)
    })
  }
  // const {_holistic} = instance
  return {
    _holistic: instance._holistic || {},
    isClass,
    actions,
    propDesk,
    privateAtoms,
    atoms
  }
}

const publicProxyHandlers = {
  get({ body, atoms }, key) {
    // console.log("public call", key)
    return body[key] || atoms[key]
  },
}
const bodyActionProxyHandlers = {
  get({ ctx, body,  atoms }, key) {
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
const atomsProxyHandler = {
  get({ atoms, domain }, key) {
    return atoms[key] || addAtom(key, atoms, domain)
  },
}
