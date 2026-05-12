import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ListView from '../views/ListView.vue'
import DetailView from '../views/DetailView.vue'
import AddEditView from '../views/AddEditView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '转盘' } },
    { path: '/list', name: 'list', component: ListView, meta: { title: '菜谱' } },
    { path: '/detail/:id', name: 'detail', component: DetailView, meta: { title: '详情' } },
    { path: '/add', name: 'add', component: AddEditView, meta: { title: '添加菜谱' } },
    { path: '/edit/:id', name: 'edit', component: AddEditView, meta: { title: '编辑菜谱' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { title: '设置' } },
  ],
})

export default router
