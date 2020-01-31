// Copyright (c) Gleb Panteleev. All rights reserved. Licensed under the MIT license.

/**
 * LaSens - это машина состояний основанная на js функторе Alak.
 * LaSens - Is it infinity state machine based on Alak functor for node.js backend apps, and any frontend as Vue and React.
 * Please, open issue for english documentation.
 *
 * @remarks
 * LaSens может служить для описания взаимосвязей логики состояния в глобальных и динамических
 * хранилищах северных приложений node.js и клиентских таких как Vue и React.
 * Контейнер Alak служит функциональной альтернативой шины сообщений.
 * Все операции доставки, св
 * язи и изменения данных выполняются
 * @packageDocumentation
 */

export { qubit, holistic, stored } from './decor'
export { La, LaSens, LaSensType, ISens } from './core'
export { Dynamique, IDynamique } from './dynamique'

