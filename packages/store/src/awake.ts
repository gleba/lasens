import { IBox, IWay } from './index'
import { A } from 'alak'
import {
  domainActions,
  domainAtoms,
  domainLink,
  registerBodyDomain,
} from './domain'
import { decorate } from './decor'

const systemActions = {
  _start: true as any,
  _decay: true as any,
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
  const sens = getSens(thing, domain)
  const body = { ...sens.atoms } as LasHiddenSens
  const proxyAtoms = new Proxy({ body, domain }, atomsProxyHandler)
  sens.isClass && decorate(proxyAtoms, thing)
  body.$ = proxyAtoms
  body.$uid = Math.random()
  body.$id = id || way.domain || body.$uid
  body.$actions = domainActions
  body.$atoms = domainAtoms
  if (target) body.$target = target
  const proxy = proxyBody(body, proxyAtoms, sens.actions)
  const { _start } = body

  _start && _start(proxyAtoms, domainLink)
  return proxy
}

function proxyBody(body, atoms, actions) {
  const proxy = new Proxy({ body, atoms }, bodyProxyHandlers)
  actions &&
    Object.keys(actions).forEach(key => {
      body[key] = actions[key].bind(proxy)
    })
  return proxy
}

export const addAtom = (key, body: any, domain?, value?) => {
  const atom = value ? A(value) : A()
  atom.setId(domain + '.' + key)
  atom.setName(key)
  body[key] = atom
  return atom
}
function getSens(thing: any, domain) {
  const atoms = {},
    actions = {}
  let instance
  let isClass = false
  if (typeof thing === 'function') {
    instance = new thing()
    isClass = true
    let protoOfInstance = Object.getPrototypeOf(instance)
    let methods = Object.getOwnPropertyNames(protoOfInstance)
    methods.shift()
    methods.forEach(key => {
      actions[key] = instance[key]
    })
    Object.keys(instance).forEach(key =>
      addAtom(key, atoms, domain, instance[key])
    )
  } else {
    instance = thing
    Object.keys(thing).forEach(key => {
      let value = thing[key]
      if (typeof value === 'function') actions[key] = value
      else addAtom(key, atoms, domain, value)
    })
  }

  return {
    isClass,
    actions,
    atoms,
  }
}

const bodyProxyHandlers = {
  get({ body, atoms }, key) {
    if (key[0] === '$') return body[key]
    const a = body[key] || atoms[key]
    return a.value
  },
  set({ body, atoms }, key, value) {
    const a = body[key] || atoms[key]
    a(value)
    return true
  },
}
const atomsProxyHandler = {
  get({ body, domain }, key) {
    return body[key] || addAtom(key, body, domain)
  },
}
