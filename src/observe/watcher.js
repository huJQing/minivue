import { pushTarget, popTarget } from "./dep"
let id = 0

export default class Watcher {
    constructor(vm, exprOrFn, cb, options) {
        this.vm = vm
        this.exprOrFn = exprOrFn
        this.cb = cb
        this.options = options
        this.id = id++
        this.deps = []
        this.depsId = new Set()
        if (typeof exprOrFn === 'function') {
            this.getter = exprOrFn
        }
        this.get()
    }
    get() {
        // 在调用方法之前先把当前watcher实例推到全局Dep.target上
        pushTarget(this)
        //如果watcher是渲染watcher 那么就相当于执行  vm._update(vm._render()) 这个方法在render函数执行的时候会取值 从而实现依赖收集
        this.getter()
        // 在调用方法之后把当前watcher实例从全局Dep.target移除
        popTarget()
    }
    addDep(dep) {
        let id = dep.id
        if (!this.depsId.has(id)) {
            this.depsId.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }
    update() {
        this.get()
    }
}