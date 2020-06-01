/// <reference path="../global.d.ts"/>
type ClassInstance = new (...args: any) => any
type ClassToKV<T> = T extends ClassInstance ? InstanceType<T> : never

type PublicFlow<T> = Omit<IAtom<T>, keyof HiddenAtomProps>
type NoFunctionValue =
  boolean
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

interface ILaSensStore<Thing, IDomain> {
  _start?(ln: LinkedThinkOf<Thing, IDomain>): void
  _decay?(): void
}

type LasFilterFlags<T, Condition> = {
  [Key in keyof T]: T[Key] extends Condition ? Key : never
}

type LasAllowedNames<T, Condition> = LasFilterFlags<T, Condition>[keyof T]
type LasHiddenSens = {
  $?: any
  _?: any
  $target: any
  $atoms?: any
  $actions?: any
  $uid?: any
  $id?: any
  _start?: AnyFunction
  _decay?: AnyFunction
  _private:any
}

type LasClarify<T> = Omit<T, keyof LasHiddenSens>
type LasAtomized<T> = { readonly [K in keyof T]: IAtom<T[K]> }

declare type LinkedThinkOf<T, D> = {
  $:LasAtomized<RmFunc<T>>
  _:LasPrivateFrom<T>
} & LinksTo<D>

type RmType<T, Condition> = Omit<T, LasAllowedNames<T, Condition>>
type PickType<T, Condition> = Pick<T, LasAllowedNames<T, Condition>>
type RmFunc<T> = RmType<LasClarify<T>, Func>
type OnlyFunc<T> = PickType<LasClarify<T>, Func>
type Func = (args: any) => any

type LasAtomsFrom<T> = T extends { atoms: any } ? T['atoms'] : any
type LasActionsFrom<T> = T extends { actions: any } ? T['actions'] : any
type LasPrivateFrom<T> = T extends { _private: any } ? LasAtomized<StyledThing<T['_private']>> : any
type DomainActions<D> = { [K in keyof D]: LasActionsFrom<D[K]> }
type DomainAtoms<D> = { [K in keyof D]: LasAtomsFrom<D[K]> }

interface LinksTo<D> {
  id: string | number
  uid: number
  atoms: DomainAtoms<D>
  actions: DomainActions<D>
  target?: any
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

type XT<X> = OnlyFunc<StyledThing<X>>
