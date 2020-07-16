import Vue from 'vue'
import About from '../pages/about'
import Home from '../pages/home'
import Router from '../../vuerouter'

Vue.use(Router)

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/about',
        component: About
    },
    {
        path: '/home',
        component: Home
    }
]

const router = new Router({
    mode: 'hash',
    routes
})

export default router
