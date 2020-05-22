export abstract class DomainStore<Thing, IDomain> implements ILaSensStore<Thing, Domain> {
  $: ThinkOf<Thing>
  $atoms: DomainAtoms<IDomain>
  $actions: DomainActions<IDomain>
  $uid: string | number
  $id?: string | number
  $object?: any
  abstract _constructor(a: ThinkOf<Thing>, $?: LinksTo<Domain>): void
}

export abstract class Store<Thing> extends DomainStore<Thing, Domain> {}


export function Thing<T>(className: T):ThingConstructor<T> {
  return null as ThingConstructor<T>
}
export interface Domain {

}
