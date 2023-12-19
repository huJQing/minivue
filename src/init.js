import { initState } from "./state";
import { compileToFunctions } from "./compiler";
import { mountComponent } from "./lifecycle";
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        const vm = this;
        vm.$options = options;
        // 初始化状态
        initState(vm);

        // 如果有el属性 进行模板渲染
        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)

        if (!options.render) {
            let template = options.template

            if (!template && el) {
                // 如果不存在render和template 但是存在el属性 直接将模板赋值到el所在的外层html结构（就是el本身 并不是父元素）
                template = el.outerHTML;
            }


            // 最终需要把tempalte模板转化成render函数
            if (template) {
                const render = compileToFunctions(template);
                options.render = render;
            }
        }

        return mountComponent(vm, el)
    }
}