import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ShareView from '../views/ShareView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/share', name: 'share', component: ShareView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
