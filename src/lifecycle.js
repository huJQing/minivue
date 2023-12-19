export function mountComponent(vm, el) {
    vm.$el = el
    vm._update(vm._render());
}

export function lifecycleMixin(Vue) {
    Vue.prototype._updata = function (vnode) {
        const vm = this;
        patch(vm.$el, vnode)
    }
}