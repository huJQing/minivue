import { initMixin } from './init'
import { lifecycleMixin } from './lifecycle.js';
import { renderMixin } from './render';

function Vue(options) {
    this._init(options)
}

initMixin(Vue)

renderMixin(Vue)

lifecycleMixin(Vue)

export default Vue;