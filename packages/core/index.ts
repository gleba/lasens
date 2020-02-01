// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * Основной набор инструментов для создания и описания структуры модулей "la sens".
 * @remarks
 * Пример модудля
 * ```typescript
 * class SomeModule {
 *   @qubit hello: string
 * actions({ f }: La<SomeModule, IStore>) {
 *     f.hello.up(console.log)
 *     return {
 *       say(){
 *         f.hello("world")
 *       }
 * }}}
 * const modules = { SomeModule }
 * type IStore = ISens<typeof modules>
 * const store = LaSens(modules)
 * store.actions.SomeModule.say()
 * // world
 * ```
 * @packageDocumentation
 */

export { qubit, holistic, stored } from './decor'
export { La, LaSens, LaSensType, ISens } from './core'
export { Dynamique, IDynamique } from './dynamique'

