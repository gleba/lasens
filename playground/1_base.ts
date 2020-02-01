import { ISens, La, LaSens, qubit } from '../packages/core'

/**
 * Базовый модуль представляет собой класс содержащий поля данных,
 * что при компиляции оборачиваются в функтор Alak.
 * Функция Actions - выступает в роли конструктора модуля,
 *
 * в её теле могут быть описаны связи и действия над функторами.
 * Результат функции Actions - возвращает объект публично доступных действий модуля.
 **/

export class BaseModule {
  @qubit thing: string
  actions({ f }: La<BaseModule, IStore>) {
    f.thing.up(console.log)
    return {
      sayWorld() {
        f.thing('world')
      },
    }
  }
}




// создание хранилища и пример работы с действиями и потоками
const modules = { BaseModule }
type IStore = ISens<typeof modules>
const store = LaSens(modules).renew()
store.flows.BaseModule.thing('hello')
store.actions.BaseModule.sayWorld()
// выведет в терминале
// hello
// world
