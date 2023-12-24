import {arrayMethods} from "./array";
import Dep from "./dep";

class Observe {
    constructor(value) {
        this.dep = new Dep()
        // 给Observe实例加上__ob__以方便数组观测时新增了元素后调用observeArray添加响应式观测
        Object.defineProperty(value, "__ob__", {
            //  值指代的就是Observer的实例
            value: this,
            //  不可枚举
            enumerable: false,
            writable: true,
            configurable: true,
        });
        if (Array.isArray(value)) {
            value.__proto__ = arrayMethods
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

    walk(data) {
        Object.keys(data).forEach(key => {
            let value = data[key]
            defineReactive(data, key, value)
        })
    }


    observeArray(items) {
        for (let i = 0; i < items.length; i++) {
            observe(items[i]);
        }
    }
}

function defineReactive(data, key, value) {
    let childOb = observe(value)
    // 为每个属性实例化一个Dep
    let dep = new Dep()
    Object.defineProperty(data, key, {
        get() {
            // 页面取值的时候 可以把watcher收集到dep里面--依赖收集
            if (Dep.target) {
                // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
                dep.depend()
                if (childOb) {
                    // 属性的值依然是一个对象 包含数组和对象 里面的dep进行依赖收集
                    childOb.dep.depend();
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set(newValue) {
            if (newValue === value) return
            // 如果赋值的新值也是一个对象  需要观测
            observe(newValue)
            value = newValue
            // 通知渲染watcher去更新--派发更新
            dep.notify();
        }
    })
}

function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if (Array.isArray(e)) {
            dependArray(e)
        }
    }
}

export function observe(value) {
    if (
        Object.prototype.toString.call(value) === '[object Object]' ||
        Array.isArray(value)
    ) {
        return new Observe(value)
    }
}