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
  // const extend = o => ({
  //   as: propName => asFx[propName] = o
  // })
  const extendsFlowHandler = {
    get(flow, key) {
      switch (key) {
        case 'asIs':
          let id =  flow.id.split(".")[2]
          asFx[id] = [flow]
          return wraper => {
            asFx[id] = [flow, wraper]
            return mainProxy
          }
        case 'as':
          return (propName, wraper) => {
            asFx[propName] = [flow, wraper]
            return mainProxy
          }

      }
      return flow[key]
    }
  }
  const flowHandler = moduleId => ({
    get(flow, key) {
      let id = moduleId + "." + key
      let proxyFlow = usedFlows[id]
      if (!proxyFlow) {
        let targetFlow = flow[key]
        let newFlow = A()
        newFlow.setId(tag + "." + targetFlow.id)
        usedFlows[id] = proxyFlow = new Proxy(newFlow, extendsFlowHandler)
        proxyFlow.addMeta("from", targetFlow)
        targetFlow.up(proxyFlow)
        proxyFlow.up(v => {
          if (targetFlow.v != v)
            targetFlow(v)
        })
      }
      return proxyFlow
    }
  })

  const mainProxy = new Proxy(flows, {
    get(modules, key) {
      let m = usedModules[key]
      if (!m)
        usedModules[key] = m = new Proxy(modules[key], flowHandler(key))
      return m
    }
  })
  return [mainProxy, usedFlows, asFx]
}

const DEBUG_VUE = "vue"

export function installMixin(sens: ISens<any>) {

  const componentData = new WeakMap()
  return {
    data(...a) {
      if (componentData.has(this)) return componentData.get(this)
      return Object.create(null)
    },

    beforeCreate() {
      if (!this.$vnode) return
      let tag = this.$options._componentTag || this.$vnode.tag

      let instance = sens.newContext([tag, DEBUG_VUE, ...DEBUG_VIEW])
      this.$flow = instance.flows
      this.$actions = instance.actions
      this.$state = instance.state


      let fromFn = this.$options.from
      if (fromFn) {
        let [proxyFlows, usedFlows, asMappedFlows] = useVueGraphProxy(tag, instance.flows)
        //
        //
        fromFn.bind(this)
        fromFn.apply(this, [proxyFlows])
        //
        let asKeys = Object.keys(asMappedFlows)


        if (asKeys.length > 0) {
          let data = {}
          componentData.set(this, data)
          asKeys.forEach(k => {
            let [f, wrapper] = asMappedFlows[k]
            this[k] = data[k] = wrapper ? wrapper(f.value) : f.value
          })
        }
        this._usedFlows = usedFlows
        this._asMappedFlows = asMappedFlows
      }
    },
    created() {
      let flows = this._asMappedFlows
      if (flows) {
        Object.keys(flows).forEach(k => {
            let [flow, wrapper] = flows[k]

            if (wrapper) {
              flow.up(v => this.$set(this, k, wrapper(v)))
            } else {
              flow.up(v => this.$set(this, k, v))
            }
          }
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
