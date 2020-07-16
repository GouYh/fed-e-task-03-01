let _Vue = null

export default class VueRouter {
    static install (Vue) {
        // 1.判断当前插件是否已经安装，如果已经安装，则不需要再次安装
        if (VueRouter.install.installed) {
            return
        }
        VueRouter.install.installed = true

        // 2.将Vue的构造函数记录到全局变量中，将来会在VueRouter实例中使用
        _Vue = Vue
        // 3.把创建Vue实例时传入的router对象注入到所有Vue实例上
        // 混入
        _Vue.mixin({
            beforeCreate () {
                if (this.$options.router) { // 判断是否组件，如果为组件则不执行
                    _Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })
    }

    constructor (options) {
        this.options = options
        this.mode = options.mode ? options.mode : 'hash'
        this.routeMap = {}
        let hashPath = window.location.hash.slice(1) || "/"
        let historyPath = window.location.pathname || "/"
        // 用于刷新页面时，初始化路由
        const path = this.mode === 'hash' ? hashPath : historyPath
        this.data = _Vue.observable({
            current: path, // 用于存储当前路由地址，默认为‘/’
        })
    }

    init () {
        this.createRouteMap()
        this.initComponents(_Vue)
        this.initEvent()
    }

    /**
     * 将options中routes，即路由规则转换为键值对存储到routeMap中
     * 键：路由地址
     * 值：组件
     *  */
    createRouteMap () { 
        // 遍历所有路由规则，将路由规则解析成键值对的形式，存储到routeMap中
        this.options.routes.forEach(route => {
            this.routeMap[route.path] = route.component
        })
    }


    /**
     * 传入Vue的原因是，减少和外部的依赖
     * 创建router-link和router-view的组件
     */
    initComponents (Vue) {
        const self = this
        Vue.component('router-link', {
            props: {
                to: String
            },
            // template: '<a :href="to"><slot></slot></a>'
            render (h) {
                return h('a', {
                    attrs: {
                        href: self.mode === 'hash' ? `#${this.to}` : this.to
                    },
                    on: {
                        click: this.clickHandler
                    }
                }, [this.$slots.default])
            },
            methods: {
                clickHandler (e) {
                    if (self.mode === 'history') {
                        history.pushState({}, '', this.to)
                        this.$router.data.current = this.to
                        e.preventDefault()
                    }
                }
            }
        })

        Vue.component('router-view', {
            render (h) {
                // 找到当前路由地址
                const current = self.data.current
                // 根据路由地址在routeMap中找到对应组件
                const component = self.routeMap[current]
                // 使用h函数将组件转换为虚拟dom
                return h(component)
            }
        })
    }

    /**
     * 用于注册popstate事件，用于监听浏览器前进后退按钮事件
     */
    initEvent () {
        this.mode !== 'hash' ?
        window.addEventListener('popstate', () => {
            this.data.current = window.location.pathname
        }) :
        window.addEventListener('hashchange', () => {
            this.data.current = window.location.hash.slice(1) || "/"
        })
    }
}
