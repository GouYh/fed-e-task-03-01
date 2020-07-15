class Dep {
    constructor () {
        // 存储所有的观察者
        this.subs = []
    }

    // 添加观察者
    addSub (sub) {
        if (sub && sub.update) {
            this.subs.push(sub)
        }
    }
    // 发送通知
    notify () {
        // 遍历所有观察者，调用观察者的方法
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}