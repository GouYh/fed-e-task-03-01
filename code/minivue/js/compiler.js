class Compiler {
    constructor (vm) {
        this.el = vm.$el
        this.vm = vm
        this.compile(this.el)
    }
    // 编译模板，处理文本节点和元素节点
    compile (el) {
        let childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            if (this.isTextNode(node)) {
                // 处理文本节点
                this.compileText(node)
            } else if (this.isElementNode(node)) {
                // 处理元素节点
                this.compileElement(node)
            }

            // 判断node节点是否有子节点，如果有子节点，则要递归调用compile
            if (node.childNodes && node.childNodes.length) {
                this.compile(node)
            }
        })
    }
    // 编译元素节点，处理指令
    compileElement (node) {
        // 遍历所有属性节点
        let attributes = node.attributes
        Array.from(attributes).forEach(attr => {
            let attrName = attr.name
            let key = attr.value
            // 判断是否是指令
            if (this.isDirective(attrName)) {
                // v-text --> text
                attrName = attrName.substr(2)
                this.update(node, key, attrName)
            }
            // 判断是否是事件
            if (this.isEvent(attrName)) {
                // 判断绑定事件是通过@还是通过v-on:
                if (attrName.indexOf('@') === 0) {
                    attrName = attrName.substring(1)
                } else {
                    attrName = attrName.substring(5)
                }
                this.eventHandler(node, this.vm, key, attrName)
            }
        })
    }

    update (node, key, attrName) {
        let updateFn = this[`${attrName}Updater`]
        updateFn && updateFn.call(this, node, key, this.vm[key])
    }

    // 处理v-on指令
    eventHandler (node, vm, key, value) {
        let fn = vm.$options.methods && vm.$options.methods[key]
        if (value && fn) {
            node.addEventListener(value, fn.bind(vm))
        }
    }

    // 处理v-html指令
    htmlUpdater (node, key, value) {
        node.innerHTML = value
        new Watcher(this.vm, key, (newValue) => {
            node.innerHTML = newValue
        })
    }

    // 处理v-text指令
    textUpdater (node, key, value) {
        node.textContent = value
        new Watcher(this.vm, key, (newValue) => {
            node.textContent = newValue
        })
    }

    // 处理v-model指令
    modelUpdater (node, key, value) {
        node.value = value
        new Watcher(this.vm, key, (newValue) => {
            node.value = newValue
        })
        // 双向绑定
        node.addEventListener('input', () => {
            this.vm[key] = node.value
        })
    }

    // 编译文本节点，处理差值表达式
    compileText (node) {
        let reg = /\{\{(.+?)\}\}/
        let value = node.textContent
        if (reg.test(value)) {
            let key = RegExp.$1.trim()
            node.textContent = value.replace(reg, this.vm[key])

            // 创建watcher对象，当数据改变时更新视图
            new Watcher(this.vm, key, (newValue) => {
                node.textContent = newValue
            })
        }
    }
    // 判断元素属性是否是指令
    isDirective (attrName) {
        return attrName.startsWith('v-') && !attrName.startsWith('v-on:')
    }
    // 判断节点是否是文本节点
    isTextNode (node) {
        return node.nodeType === 3
    }
    // 判断节点是否是元素节点
    isElementNode (node) {
        return node.nodeType === 1
    }
    // 判断是否是事件
    isEvent (attrName) {
        return attrName.indexOf('@') === 0 || attrName.startsWith('v-on:')
    }
}