/// <reference path="../global.d.ts"/>
type ClassInstance = new (...args: any) => any
type ClassToKV<T> = T extends ClassInstance ? InstanceType<T> : never

type PublicFlow<T> = Omit<IAtom<T>, keyof HiddenAtomProps>
type NoFunctionValue =
  | boolean
  | string
  | number
  | null
  | undefined
  | NoFunctionObject

interface NoFunctionObject {
  [key: string]: NoFunctionValue
}

type PrivateFlow = ClassInstance | NoFunctionObject

type HiddenAtomProps = {
  addMeta: any
  getMeta: any
  hasMeta: any
  setName: any
  setId: any
  decay: any
}

// interface ILaSensStore<Thing, IDomain> {
//   // _start?(ln: LinkedThinkOf<Thing, IDomain>): void
//   // _decay?(): void
// }

type LosFilterFlags<T, Condition> = {
  [Key in keyof T]: T[Key] extends Condition ? Key : never
}

type LosAllowedNames<T, Condition> = LosFilterFlags<T, Condition>[keyof T]
type LosHiddenSens = {
  $?: any
  _?: any
  // __?: any
  $target: any
  $uid?: any
  $id?: any
  $link?: any
  // $holistic?: any
  // _holistic?: any
  _start?: AnyFunction
  _decay?: AnyFunction
  _private?: any
}

type LosClarify<T> = Omit<T, keyof LosHiddenSens>
type LosAtomized<T> = { readonly [K in keyof T]: IAtom<T[K]> }

type LasAtoms<T> = LosAtomized<RmFunc<T>> & LosPrivateFrom<T>
declare type LinkedThinkOf<T, D> = {
  $: LasAtoms<T>
  _holistic: LosHolyFrom<T>
  // _:LosPrivateFrom<T>
} & LinksTo<D>

type RmType<T, Condition> = Omit<T, LosAllowedNames<T, Condition>>
type PickType<T, Condition> = Pick<T, LosAllowedNames<T, Condition>>
type RmFunc<T> = RmType<LosClarify<T>, Func>
type OnlyFunc<T> = PickType<LosClarify<T>, Func>
type Func = (args: any) => any

type LosAtomsFrom<T> = T extends { atoms: any } ? T['atoms'] : any
type LosActionsFrom<T> = T extends { actions: any } ? T['actions'] : any
type LosHolyFrom<T> = T extends { _: any } ? T['_'] : any
type LosPrivateFrom<T> = T extends { _private: any }
  ? LosAtomized<StyledThing<T['_private']>>
  : any
type DomainActions<D> = { [K in keyof D]: LosActionsFrom<D[K]> }
type DomainAtoms<D> = { [K in keyof D]: LosAtomsFrom<D[K]> }

interface LinksTo<D> {
  id: string | number
  uid: number
  atoms: DomainAtoms<D>
  actions: DomainActions<D>
}

type AtomizedSingleThing<X> = LosClarify<X> &
  LosAtomized<RmFunc<X>> &
  PublicThing<X>

interface PublicThing<X> {
  $: {
    id: string
    uid: string | number
    domain: string
    target?: any
  }
  _?: LosHolyFrom<X>
}

interface AtomizedMultiThing<X> extends PublicThing<X> {
  (id: any): AtomizedSingleThing<X>
  remove(id: any): void
  broadcast: AtomizedSingleThing<X>
  onNewRegistration(listener: (thing: AtomizedSingleThing<X>) => void)
}

type BodySens<X> = LosAtomized<RmFunc<X>> &
  OnlyFunc<X> &
  PublicThing<X> & {
    _?: LosHolyFrom<X>
  }

interface LifeCycleOption {
  immediatelyStart?: boolean
  decayByInactivity?: boolean
  decayDelay?: number
}
// type LosAany<T> = { readonly [K in keyof T]: IAtom<T[K]> }

interface CustomAction {
  newAction(): any
}

interface ExtendedPrivateAtoms<X, P> extends ExtendedActions<X, P> {
  privateAtoms<P>(a: P): ExtendedActions<X, StyledThing<P>>
}

interface EdgeConstructor<X, P> extends LifeCycle<X> {
  constructor<AO>(
    fn: (body: BodySens<X & P>) => AO
  ): LifeCycle<X & UnpackedPromise<AO>>
}

interface ExtendedActions<X, P> extends EdgeConstructor<X, P> {
  publicActions<AO>(
    actions: AO
  ): EdgeConstructor<X & OnlyFunc<StyledThing<AO>>, P>
}

interface LifeCycle<X> extends ExtendDomain<X> {
  lifeCycle(options: LifeCycleOption): ExtendDomain<X>
}
interface TCFinalizeUp<X> {
  register(): AtomizedSingleThing<X>
  multiRegister(): AtomizedMultiThing<X>
}
interface ExtendDomain<X> extends TCFinalizeUp<X> {
  domain(namespace: string): TCFinalizeUp<X>
}

interface ThingConstructor<X> extends ExtendedPrivateAtoms<X, X> {}

type StyledThing<T> = T extends ClassInstance ? ClassToKV<T> : T

type Thing<X> = ThingConstructor<StyledThing<X>>

// type XT<X> = OnlyFunc<StyledThing<X>>