export abstract class DomainStore<Thing, IDomain> implements ILaSensStore<Thing, Domain> {
  $: ThinkOf<Thing>
  $atoms: DomainAtoms<IDomain>
  $actions: DomainActions<IDomain>
  $uid: string | number
  $id?: string | number
  $object?: any

}

export abstract class Store<Thing> extends DomainStore<Thing, Domain> {}


export function MakeThing<T>(className: T):ThingConstructor<T> {
  return null as ThingConstructor<T>
}
export interface Domain {

}


MakeThing(class Z extends Store<Z>{
  ok:number
  _constructor(a: ThinkOf<Z>) {

  }
})
  .lifeCycle({
    decayByInactivity:true
  })
  .domain("x")
  .multiStartUp()

