import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login'
import Home from "@/views/Home";
import Menu from './components/Menu';
import ProjectDetail from "@/views/ProjectDetail";

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            component: Login
        },
        {
            path: '/home',
            component: Home
        },
        {
            path: '/menu',
            component: Menu
        },
        {
            path: '/project_detail/',
            component: ProjectDetail
        }
    ]
})
