import { patch } from "./vnode/patch"
export function mountComponent(vm, el) {
    debugger
    vm.$el = el
    vm._updata(vm._render());
}

export function lifecycleMixin(Vue) {
    Vue.prototype._updata = function (vnode) {
        const vm = this;
        patch(vm.$el, vnode)
    }
}