import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import ReportsPage from '../views/ReportsPage.vue';
import DataUploadPage from '../views/DataUploadPage.vue';
import RegisterPage from '@/views/RegisterPage.vue';
import ForgotPasswordPage from '@/views/ForgotPasswordPage.vue';
import AdminPage from '../views/AdminPage.vue';
import { state } from '@/state';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    beforeEnter: (to, from, next) => {
      // Check if the user is authenticated
      if (sessionStorage.getItem('isAuthenticated')) {
        // If authenticated, redirect to /home
        next('/home');
      } else {
        next();
      }
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordPage,
    beforeEnter: (to, from, next) => {
      // Check if the user is authenticated
      if (sessionStorage.getItem('isAuthenticated')) {
        // If authenticated, redirect to /home
        next('/home');
      } else {
        next();
      }
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportsPage,
    beforeEnter: (to, from, next) => {
      // Check if the user is authenticated
      if (!sessionStorage.getItem('isAuthenticated')) {
        next('/home'); // Redirect to home if not authenticated
      } else {
        next();
      }
    }
  },
  {
    path: '/data-upload',
    name: 'DataUpload',
    component: DataUploadPage,
    beforeEnter: (to, from, next) => {
      // Check if the user is authenticated
      if (!sessionStorage.getItem('isAuthenticated')) {
        next('/home'); // Redirect to home if not authenticated
      } else {
        next();
      }
    }
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: RegisterPage,
    beforeEnter: (to, from, next) => {
      // Check if the user is authenticated
      if (sessionStorage.getItem('isAuthenticated')) {
        // If authenticated, redirect to /home
        next('/home');
      } else {
        next();
      }
    }
  },
  {
    path: '/admin',
    name: 'AdminPage',
    component: AdminPage,
    beforeEnter: (to, from, next) => {
      // Check if the user is authenticated
      if (!state.isAdmin) {
        // If authenticated, redirect to /home
        next('/home');
      } else {
        next();
      }
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;