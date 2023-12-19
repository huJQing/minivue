import { observe } from './observe/index.js'

export function initState(vm) {
    const opts = vm.$options
    if (opts.props) {
        initProps(opts.props)
    }
    if (opts.methods) {
        initMethod(vm)
    }
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm);
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

function initData(vm) {
    let data = vm.$options.data

    // data是function
    data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

    for (let key in data) {
        // 代理data上的属性到vm上，这样就可以通过this.a的方式直接访问了
        proxy(vm, '_data', key)
    }
    observe(data)
}

function proxy(object, sourceKey, key) {
    Object.defineProperty(object, key, {
        get() {
            return object[sourceKey][key]
        },
        set(val) {
            object[sourceKey][key] = val
        }
    })
}