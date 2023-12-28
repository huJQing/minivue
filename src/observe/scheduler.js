import {nextTick} from "../util/next-tick";

let queue = []
let has = {}
function flushSchedulerQueue(){
    for(let i = 0;i < queue.length;i++){
        queue[i].run()
    }
    queue = []
    has = {}
}

export function queueWatcher(watcher){
    const id = watcher.id
    if(has[id] === undefined){
        queue.push(watcher)
        has[id] = true
        nextTick(flushSchedulerQueue)
    }
}