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
  console.log({domain})

  const { thing } = way
  const sens = getSens(thing, domain)
  const body = { ...sens.atoms } as LosHiddenSens
  const proxyAtoms = new Proxy({ body, domain }, atomsProxyHandler)
  sens.isClass && decorate(proxyAtoms, thing)
  body.$ = proxyAtoms
  body.$uid = Math.random()
  body.$id = id || way.domain || body.$uid
  body.$actions = domainActions
  body.$atoms = domainAtoms
  body.$holistic = sens.holistic
  body._ = new Proxy({body:sens.privateAtoms, domain}, atomsProxyHandler)
  if (target) body.$target = target
  proxyBody(body, proxyAtoms, sens.actions, sens.propDesk)
  const { _start } = body
  _start && _start({
    $:body.$,
    _:body._,
    holistic: sens.holistic,
    id:body.$id,
    uid:body.$uid,
    atoms:domainAtoms,
    actions:domainActions,
    target
  })
  return new Proxy({ body, proxyAtoms }, publicProxyHandlers)
}

function proxyBody(body, atoms, actions, desk) {
  const proxy = new Proxy({ body, atoms }, bodyProxyHandlers)
  actions &&
    Object.keys(actions).forEach(key => {
      body[key] = actions[key].bind(proxy)
    })
  desk && Object.keys(desk).forEach(key=>{
    let dp = desk[key]
    Object.defineProperty(body, key, {
      get:dp.get && dp.get.bind(proxy),
      set:dp.set && dp.set.bind(proxy),
    } as any)
  })
}

export const addAtom = (key, body: any, domain?, value?) => {
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
      addAtom(key, atoms, domain, instance[key])
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
  const {_holistic} = instance

  return {
    holistic: _holistic || {},
    isClass,
    actions,
    propDesk,
    privateAtoms,
    atoms,
  }
}

const publicProxyHandlers = {
  get({ body, proxyAtoms }, key) {
    return body[key] || proxyAtoms[key]
  },
}
const bodyProxyHandlers = {
  get({ body, atoms }, key) {
    if (key[0] === '$') return body[key]
    const a = body[key] || atoms[key]
    return a._ ? a.value : a
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
