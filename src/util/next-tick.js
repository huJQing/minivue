let callbacks = []
let pending = false;

function flushCallbacks() {
    pending = false
    for (let i = 0; i < callbacks.length; i++) {
        callbacks[i]()
    }
    callbacks.length = 0
}

// 定义一个异步方法 分别判断Promise/MutationObserver/setImmediate/setTimeout是否存在，降级处理
let timerFunc
if (typeof Promise !== "undefined") {
    const p = Promise.resolve()
    timerFunc = () => {
        p.then(flushCallbacks)
    }
} else if (typeof MutationObserver !== 'undefined') {
    let counter = 1
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)
    }
}else if(typeof setImmediate !== 'undefined'){
    timerFunc = () =>{
        setImmediate(flushCallbacks)
    }
}else{
    timerFunc = () =>{
        setTimeout(flushCallbacks)
    }
}

export function nextTick(cb){
    callbacks.push(cb)
    if(!pending){
        // 如果多次调用nextTick  只会执行一次异步 等异步队列清空之后再把标志变为false
        pending = true;
        timerFunc()
    }
}