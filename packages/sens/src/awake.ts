/**
 * @internal-all
 */
import ns, { IBox, IWay, makeRune } from './index'
import { A } from 'alak'
import { decorate } from './decor'
import { alive } from 'alak/atom/utils'

const systemFields = {
  _start: true as any,
  _decay: true as any,
  // _private: true as any,
  // _holistic: true as any,
  _: true as any,
  // body: true as any,
}

export function awake(box: IBox) {
  box.isSleep = false
  const { way } = box
  delete box.wakeUp
  return getup(way)
}

export function getup(way: IWay, id?, target?) {
  const domain = id ? way.domain + '.' + id : way.domain
  const uid = makeRune(7)
  id = id || uid

  const $ctxPublic = {
    id,
    uid,
    domain,
  } as any
  if (target) $ctxPublic.target = target

  let { holistic, atoms, proxyAtoms, bodyActions } = getSens(
    way.thing,
    domain,
    $ctxPublic
  )

  let privateThings = {} as any
  if (way.privateThings) {
    const privateThings = getSens(
      way.privateThings,
      domain,
      $ctxPublic,
      atoms,
      bodyActions
    )
    if (privateThings.bodyActions) {
      Object.assign(bodyActions, privateThings.bodyActions)
    }
  }
  if (way.publicAction) {
    const p = getSens(way.publicAction, domain, $ctxPublic, atoms, bodyActions)
    if (p.bodyActions) {
      Object.assign(bodyActions, p.bodyActions)
    }
  }
  // const { _start } = bodyActions
  // _start && _start({ ...$ctxPublic, ...deepCtx })

  const __ = {} as any
  const think = { _: holistic, $: $ctxPublic, __ }
  // const deep = bodyActions
  if (way.constructor) {
    let lasActions = way.constructor(
      new Proxy(
        { think, deep: bodyActions, proxy: proxyAtoms },
        thinkDeepProxy
      ),
      ns
    )
    const mixInBody = v => {
      v && Object.assign(bodyActions, v)
    }
    if (lasActions) {
      if (lasActions.then) {
        __.nowPromise = lasActions
        lasActions.then(v => {
          delete __.nowPromise
          mixInBody(v)
        })
      } else {
        mixInBody(lasActions)
      }
    }
  }

  let proxy = privateThings.atoms
    ? new Proxy(
        { protect: privateThings.atoms, atoms: proxyAtoms },
        protectedAtomsProxy
      )
    : proxyAtoms
  return new Proxy(
    {
      think,
      deep: bodyActions,
      proxy,
    },
    thinkDeepProxy
  )
}

function makeBodyAction(ctx, atoms, actions, desk) {
  const body = {}
  const proxy = new Proxy({ ctx, body, atoms }, bodyActionProxyHandlers)

  actions &&
    Object.keys(actions).forEach(key => {
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
  if (systemFields[key]) {
    console.error(`${key} is not allowed`)
    throw 'system field in atom'
  }
  const atom = value ? A(value) : A()
  atom.setId(domain + '.' + key)
  atom.setName(key)
  body[key] = atom
  return atom
}

const isDefined = v => v != undefined
function getSens(thing: any, domain, ctx, inAtoms?, inActions?) {
  const atoms = {},
    propDesk = {} as KV<PropertyDescriptor>,
    actions = {}
  let instance, isClass

  if (typeof thing === 'function') {
    instance = new thing()
    let protoOfInstance = Object.getPrototypeOf(instance)
    let methods = Object.getOwnPropertyNames(protoOfInstance)
    isClass = protoOfInstance.constructor
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
  // const { _private } = instance
  const holistic = instance._ || {}
  // const children = _private
  //   ? getSens(_private, `${domain}.private`, ctx, deepAtoms, deepActions)
  //   : null
  inAtoms &&
    Object.keys(atoms).forEach(k => {
      let a = inAtoms[k]
      if (a && isDefined(a.value)) return
      inAtoms[k] = atoms[k]
    })
  inActions && Object.assign(inActions, actions)
  const proxyAtoms = new Proxy(
    { atoms: inAtoms ? inAtoms : atoms, domain },
    atomsProxyHandler
  ) as any
  isClass && decorate(proxyAtoms, isClass)
  const bodyActions: any = makeBodyAction(
    {
      $: proxyAtoms,
      $id: ctx.id,
      $uid: ctx.uid,
      $target: ctx.target,
      $domain: domain,
      _: holistic,
    },
    proxyAtoms,
    inActions ? inActions : actions,
    propDesk
  )

  return {
    bodyActions,
    proxyAtoms,
    atoms,
    actions,
    propDesk,
    holistic,
  }
}

const bodyActionProxyHandlers = {
  get({ ctx, body, atoms }, key) {
    const v = ctx[key] || body[key]
    if (v) return v
    return atoms[key].value
  },
  set({ ctx, body, atoms }, key, value) {
    if (key === "_") {
      body._ = value
      return true
    }
    const a = body[key] || atoms[key]
    a(value)
    return true
  },
}
const protectedAtomsProxy = {
  get({ protect, atoms }, key) {
    if (protect[key]) {
      throw 'violation of the private area'
    }
    return atoms[key]
  },
}

// const makeMix = (first, second) => new Proxy({ first, second }, mixProxy)
// const mixProxy = {
//   get({ first, second }, key) {
//     return first[key] || second[key]
//   },
// }

const thinkDeepProxy = {
  get({ proxy, deep, think }, key) {
    return think[key] || deep[key] || proxy[key]
  },
}

const atomsProxyHandler = {
  get({ atoms, domain }, key) {
    return atoms[key] || addAtom(key, atoms, domain)
  },
}
