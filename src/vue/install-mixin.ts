// import {optionMapflow} from './option-mapflow'
// import {optionOnFlow} from './option-on-flow'
import {ISens} from "../core";
import {A} from "alak";
import {DEBUG_VIEW} from "../core/utils";

const clearCleaner = (v, t) => {
  if (v.has(t)) {
    v.get(t)()
    v.delete(t)
  }
}


function useVueGraphProxy(tag, flows) {
  const usedModules = {}
  const usedFlows = {}
  const asFx = {}
  const flowHandler = {
    get(o, key) {
      if (key === 'as')
        return propName => {
          asFx[propName] = o
          console.log({propName})
        }
      return o[key]
    }
  }
  const moduleHandler = moduleId => ({
    get(o, key) {
      let id = moduleId + "." + key
      let proxyFlow = usedFlows[id]
      if (!proxyFlow) {
        let targetFlow = o[key]
        let newFlow = A()
        newFlow.setId(tag + "." + targetFlow.id)
        usedFlows[id] = proxyFlow = new Proxy(newFlow, flowHandler)
        proxyFlow.addMeta("from", targetFlow)
        targetFlow.up(proxyFlow)
        proxyFlow.up(v=>{
          if (targetFlow.v != v)
            targetFlow(v)
        })
      }
      return proxyFlow
    }
  })

  return [new Proxy(flows, {
    get(o, key) {
      let m = usedModules[key]
      if (!m)
        usedModules[key] = m = new Proxy(o[key], moduleHandler(key))
      return m
    }
  }), usedFlows, asFx]
}

const DEBUG_VUE = "vue"
export function installMixin(sens: ISens<any>) {

  const componentData = new WeakMap()
  return {
    data() {

      if (componentData.has(this)) return componentData.get(this)
      return Object.create(null)
    },

    beforeCreate() {
      if (!this.$vnode) return
      let tag = this.$options._componentTag || this.$vnode.tag

      let instance = sens.newContext([tag, DEBUG_VUE, ...DEBUG_VIEW])
      this.$f = instance.flows
      this.$a = instance.actions
      this.$state = instance.state

      let useFn = this.$options.use
      if (useFn) {
        let [proxyFlows, usedFlows, asMappedFlows] = useVueGraphProxy(tag, instance.flows)
        useFn.bind(this)
        useFn.apply(this, [proxyFlows])
        let asKeys = Object.keys(asMappedFlows)
        if (asKeys.length > 0) {
          let data = {}
          componentData.set(this, data)
          asKeys.forEach(k => {
            this[k] = data[k] = asMappedFlows[k].value
          })
        }
        this._usedFlows = usedFlows
        this._asMappedFlows = asMappedFlows

      }
    },
    created() {
      let flows = this._asMappedFlows
      if (flows) {
        Object.keys(flows).forEach(k =>
          flows[k].up(v => this.$set(this, k, v))
        )
      }
    },
    beforeDestroy() {
      let flows = this._usedFlows
      if (flows) {
        Object.keys(flows).forEach(k => {
            let f = flows[k]
            f.getMeta("from").down(f)
            // f.close()
          }
        )
      }
    }
  }
}
