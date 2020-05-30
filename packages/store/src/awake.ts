import { IBox, IWay } from './index'
import { A } from 'alak'
import { domainActions, domainAtoms, registerBodyDomain } from './domain'
import { decorate } from './decor'

const systemActions = {
  _start: true,
  _decay: true,
}
export function multiWake(way: IWay, id, target) {
  const bodyId = way.domain + '.' + id
  const sens = getSens(way.thing, bodyId)
  const body = makeBody(sens.actions, sens.atoms)
  body.$ = sens.atoms
  body.$uid = Math.random()
  body.$id = bodyId
  body.$actions = domainActions
  body.$atoms = domainAtoms
  body.$object = target
  sens.isClass && decorate(body, way.thing, way.domain +"."+id)
  if (sens.sysAction._start)
}
export function awake(box: IBox) {
  box.isSleep = false
  const { way } = box
  delete box.wakeUp
  const sens = getSens(way.thing, way.domain)
  const body = makeBody(sens.actions, sens.atoms)
  body.$ = sens.atoms
  body.$uid = Math.random()
  body.$id = way.domain || body.$uid
  sens.isClass && decorate(body, way.thing, way.domain)
  way.domain && registerBodyDomain(body)
  return body
}

function makeBody(actions, atoms):LasHiddenSens {
  const body = {}
  actions &&
    Object.keys(actions).forEach(key => {
      body[key] = actions[key].bind(body)
    })
  atoms &&
    Object.keys(atoms).forEach(key => {
      body[key] = atoms[key]
    })
  return body
}

export const addAtom = (key, body, domain?, value?) => {
  const atom = value ? A(value) : A()
  atom.setId(domain + '.' + key)
  atom.setName(key)
  body[key] = atom
  return atom
}
function getSens(thing, domain) {
  const sysAction = {},
    atoms = {},
    actions = {}
  let instance,
    methods,
    protoOfInstance,
    isClass = false
  if (thing.constructor) {
    instance = new thing()
    protoOfInstance = Object.getPrototypeOf(instance)
    methods = Object.getOwnPropertyNames(protoOfInstance)
    methods.shift()
    Object.keys(instance).forEach(key => addAtom(key, instance[key]))
    isClass = true
  } else {
    Object.keys(thing).forEach(key => {
      let value = thing[key]
      if (typeof value === 'function') methods[key] = value
      else addAtom(key, atoms, domain, value)
    })
  }
  methods.forEach(key => {
    if (systemActions[key]) {
      sysAction[key] = instance[key]
    } else {
      actions[key] = instance[key]
    }
  })
  // console.log(thing)

  return {
    sysAction,
    actions,
    atoms,
    isClass,
  }
}
