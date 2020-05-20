

type FilterFlags<T, Condition> = {
  [Key in keyof T]: T[Key] extends Condition ? Key : never
}

type AllowedNames<T, Condition> = FilterFlags<T, Condition>[keyof T]
type Hidden = {
  $:any
  $atoms:any
  $actions:any
  $uid:any
  $id:any
  $object:any
  _constructor: any
  _decay: any
}

type Clarify<T> = Omit<T, keyof Hidden>
type Atomize<T> = { readonly [K in keyof T]: T[K] }
declare type Atomic<T> = Atomize<RmFunc<T>>

type RmType<T, Condition> = Omit<T, AllowedNames<T, Condition>>
type PickType<T, Condition> = Pick<T, AllowedNames<T, Condition>>
type RmFunc<T> = RmType<Clarify<T>, Func>
type OnlyFunc<T> = PickType<Clarify<T>, Func>
type Func = (...args: any) => any

type AtomsFrom<T> = T extends { atoms: any } ? T['atoms'] : any
type ActionsFrom<T> = T extends { actions: any } ? T['actions'] : any
type DomainActions<D> = { [K in keyof D]: ActionsFrom<D[K]> }
type DomainAtoms<D> = { [K in keyof D]: AtomsFrom<D[K]> }
type Link<D> = {
  id: string | number
  uid: number
  atoms: DomainAtoms<D>
  actions: DomainActions<D>
  object?: any
}

interface Domain {}
