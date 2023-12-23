import { patch } from "./vdom/patch"
import Watcher from "./observe/watcher";
export function mountComponent(vm, el) {
    vm.$el = el
    // vm._update(vm._render());

    let updateComponent = () => {
        vm._update(vm._render());
    }
    new Watcher(vm, updateComponent, null, true)
}

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this;
        vm.$el = patch(vm.$el, vnode)
    }
}