import A, { IAtom } from 'alak'
import { type } from 'os'

// export type AtomsFrom<T> = T extends { atoms: any } ? T['atoms'] : any
// export type ActionsFrom<T> = T extends { actions: any } ? T['actions'] : any
// type DomainActions<D> = { [K in keyof D]: ActionsFrom<D[K]> }
// type DomainAtoms<D> = { [K in keyof D]: AtomsFrom<D[K]> }
//

interface IStore<Thing, IDomain> {
  _constructor?(a: Atomic<Thing>): void
  _constructor?(a: Atomic<Thing>, $?: Link<IDomain>): void
  _decay?(): void
}

export abstract class DomainStore<Thing, IDomain>
  implements IStore<Thing, Domain> {
  $: Atomic<Thing>
  $atoms: DomainAtoms<IDomain>
  $actions: DomainActions<IDomain>
  $uid: string | number
  $id?: string | number
  $object?: any
  abstract _constructor(a: Atomic<Thing>, $?: Link<Domain>): void
}

export abstract class Store<Thing> extends DomainStore<Thing, Domain> {}

type ToKV<T> = T extends new (...args: any) => any ? InstanceType<T> : never

interface ThingConstructor {}

export function Thing<T>(className: T) {
  type Thing = ToKV<T>
  const store = {
    atoms: {} as Atomic<Thing>,
    actions: {} as OnlyFunc<Thing>,
  }
  function create() {
    return store
  }
  const finalStep = {
    sleepInSilent: {
      create,
    },
  }
  const startSteps = {
    sleepOnStart: {
      ...finalStep,
      create,
    },
    awakeOnStart: {
      ...finalStep,
      create,
    },
    muiltiStore: {
      create,
    },
  }
  return {
    ...startSteps,
    namespace(ns: string) {
      return startSteps
    },
  }
}
