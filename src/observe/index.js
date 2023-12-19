import { arrayMethods } from "./array";
class Observe {
    constructor(value) {
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
    observe(value)
    Object.defineProperties(data, key, {
        set(newValue) {
            if (newValue === value) return
            value = newValue
        },
        get() {
            return value
        }
    })
}

export function observe(value) {
    if (
        Object.prototype.toString.call(value) === 'object Object' ||
        Array.isArray(value)
    ) {
        return new Observe(value)
    }
}