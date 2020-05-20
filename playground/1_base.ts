import {Store, Thing } from '../packages/store'

class Fist extends Store<Fist> {
  someVar = 0
  someVar2 = 0
  someAction() {
    this.$actions.first.someAction()
  }
  _constructor(a: Atomic<Fist>) {}
}

const first = Thing(Fist).namespace('front').awakeOnStart.create()

const second = Thing(
  class X extends Store<X> {
    someVar = 0
    someVar2 = 0
    someAction() {}
    _constructor(a: Atomic<X>, $?) {

    }
    _decay() {}
  }
).muiltiStore.create()

declare module '../packages/store' {
  export interface Domain {
    first: typeof first
    second: typeof second
  }
}
