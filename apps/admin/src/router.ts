import { createRouter, createWebHistory } from 'vue-router';
import { isAuthenticated } from './lib/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/LoginView.vue'),
      meta: { public: true },
    },
    { path: '/', name: 'dashboard', component: () => import('./views/DashboardView.vue') },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('./views/CustomersView.vue'),
    },
    { path: '/orders', name: 'orders', component: () => import('./views/OrdersView.vue') },
    {
      path: '/invitations',
      name: 'invitations',
      component: () => import('./views/InvitationsView.vue'),
    },
    {
      path: '/invitations/:id',
      name: 'invitation-edit',
      component: () => import('./views/InvitationEditView.vue'),
    },
    {
      path: '/invitations/:id/rsvps',
      name: 'invitation-rsvps',
      component: () => import('./views/RsvpsView.vue'),
    },
    {
      path: '/invitations/:id/wishes',
      name: 'invitation-wishes',
      component: () => import('./views/WishesView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach((to) => {
  if (!to.meta.public && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && isAuthenticated()) {
    return { name: 'dashboard' };
  }
});
