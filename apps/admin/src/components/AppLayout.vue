<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { currentUser, logout } from '../lib/auth';

const router = useRouter();

const navigation = [
  { name: 'Dashboard', to: '/', icon: '▦' },
  { name: 'Customers', to: '/customers', icon: '☺' },
  { name: 'Orders', to: '/orders', icon: '⬡' },
  { name: 'Invitations', to: '/invitations', icon: '✉' },
];

function onLogout() {
  logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-100">
    <aside class="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-slate-200 bg-white">
      <div class="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <span class="text-xl">💌</span>
        <span class="text-lg font-bold text-slate-800">Invitera</span>
        <span class="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600">
          ADMIN
        </span>
      </div>
      <nav class="flex-1 space-y-1 p-3">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          exact-active-class="bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
        >
          <span class="w-4 text-center">{{ item.icon }}</span>
          {{ item.name }}
        </RouterLink>
      </nav>
      <div class="border-t border-slate-200 p-4">
        <p class="truncate text-sm font-medium text-slate-700">
          {{ currentUser?.name ?? '—' }}
        </p>
        <p class="truncate text-xs text-slate-400">{{ currentUser?.email }}</p>
        <button class="btn-secondary btn-sm mt-3 w-full" type="button" @click="onLogout">
          Sign out
        </button>
      </div>
    </aside>

    <main class="ml-56 min-h-screen flex-1 p-8">
      <slot />
    </main>
  </div>
</template>
