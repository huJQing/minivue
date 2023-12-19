export class reactive {
    constructor(value) {
        this.watcherMap = new Map();
        this.model = Object.create(null);

        if (typeof value === 'object' && value !== null) {
            this.model = value
        } else {
            this.model = { value }
        }

        Object.keys.forEach(key => {
            Object.defineProperty(this.model, key, {
                set(newValue) {
                    this.watcherMap[key].forEach(cb => {
                        cb(newValue)
                    })
                },
            })

        })
    }

    $watch(key, cb) {
        const watcher = this.watcherMap.get(key)
        if (!watcher) {
            this.watcherMap.set(key, [cb])
        } else {
            watcher.push(cb)
        }
    }
}