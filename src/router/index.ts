import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import { session } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import('../views/ExercisesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/muscle',
      name: 'muscle',
      component: () => import('../views/MuscleView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../views/HistoryView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Route guard to protect authenticated routes
router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (to.meta.requiresAuth && !session.value) {
      next('/login')
    } else if ((to.path === '/login' || to.path === '/signup') && session.value) {
      next('/')
    } else {
      next()
    }
  },
)

export default router
