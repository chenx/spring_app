import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UserView from '@/views/UserView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/users',
      name: 'users',
      component: UserView,
      meta: { requiresAuth: true }, // Meta field to mark this route as protected
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Meta field to mark this route as protected
    },
  ],
})

// Navigation Guard: Prevent unauthenticated users from visiting the dashboard
router.beforeEach((to, _from, next) => {
  const isAuthenticated = !!localStorage.getItem('token') // Or check your Auth state
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // next('/login')
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && isAuthenticated) {
    // If already logged in, skip the login page and send them to the dashboard
    next('/dashboard')
  } else {
    // If it's a public route (like "/") or the user is logged in, let them through
    next()
  }
})

export default router
