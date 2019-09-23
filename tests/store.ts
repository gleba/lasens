import {BaseModule} from './modules/BaseModule'
import {AlaXStore, StoreModules} from "../src/CoreX";


const storeGraph = {
  base: BaseModule,

}


export type XStore = StoreModules<typeof storeGraph>

export function InitStore() {
  let store = AlaXStore(storeGraph)
}
