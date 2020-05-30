/// <reference path="../global.d.ts"/>
type ClassInstance = new (...args: any) => any
type ClassToKV<T> = T extends ClassInstance ? InstanceType<T> : never

type PublicAtom<T> = Omit<IAtom<T>, keyof HiddenAtomProps>
type HiddenAtomProps = {
  addMeta: any
  getMeta: any
  hasMeta: any
  setName: any
  setId: any
  decay: any
}

interface ILaSensStore<Thing, IDomain> {
  _constructor?(a: ThinkOf<Thing>): void
  _constructor?(a: ThinkOf<Thing>, $?: LinksTo<IDomain>): void
  _decay?(): void
  readonly $: ThinkOf<Thing>
  readonly $atoms: DomainAtoms<IDomain>
  readonly $actions: DomainActions<IDomain>
  readonly $uid: string | number
  readonly $id?: string | number
  readonly $object?: any
}

type LasFilterFlags<T, Condition> = {
  [Key in keyof T]: T[Key] extends Condition ? Key : never
}

type LasAllowedNames<T, Condition> = LasFilterFlags<T, Condition>[keyof T]
type LasHiddenSens = {
  $?: any
  $atoms?: any
  $actions?: any
  $uid?: any
  $id?: any
  $object?: any
  _start?: any
  _decay?: any
}

type LasClarify<T> = Omit<T, keyof LasHiddenSens>
type LasAtomized<T> = { readonly [K in keyof T]: PublicAtom<T[K]> }
declare type ThinkOf<T> = LasAtomized<RmFunc<T>>

type RmType<T, Condition> = Omit<T, LasAllowedNames<T, Condition>>
type PickType<T, Condition> = Pick<T, LasAllowedNames<T, Condition>>
type RmFunc<T> = RmType<LasClarify<T>, Func>
type OnlyFunc<T> = PickType<LasClarify<T>, Func>
type Func = (...args: any) => any

type LasAtomsFrom<T> = T extends { atoms: any } ? T['atoms'] : any
type LasActionsFrom<T> = T extends { actions: any } ? T['actions'] : any
type DomainActions<D> = { [K in keyof D]: LasActionsFrom<D[K]> }
type DomainAtoms<D> = { [K in keyof D]: LasAtomsFrom<D[K]> }

interface LinksTo<D> {
  id: string | number
  uid: number
  atoms: DomainAtoms<D>
  actions: DomainActions<D>
  object?: any
}

type AtomizedSingleThing<X> = LasAtomized<RmFunc<X>> & OnlyFunc<X>

interface AtomizedMultiThing<X> {
  (id: any): AtomizedSingleThing<X>
  remove(id: any): void
  broadcast: AtomizedSingleThing<X>
}

interface LifeCycleOption {
  immediatelyStart?: boolean
  decayByInactivity?: boolean
  decayDelay?: number
}
interface LifeCycle<X> extends TCStep<X> {
  lifeCycle(options: LifeCycleOption): TCStep<X>
}
interface TCFinalizeUp<X> {
  register(): AtomizedSingleThing<X>
  multiRegister(): AtomizedMultiThing<X>
}
interface TCStep<X> extends TCFinalizeUp<X> {
  domain(namespace: string): TCFinalizeUp<X>
}

interface ThingConstructor<X> extends LifeCycle<X>, TCStep<X> {}

type StyledThing<T> = T extends ClassInstance ? ClassToKV<T> : T

type Thing<X> = ThingConstructor<StyledThing<X>>
