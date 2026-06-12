<script setup lang="ts">
import type { AdminStats } from '@invitera/shared';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api, ApiError } from '../lib/api';

const stats = ref<AdminStats | null>(null);
const error = ref<string | null>(null);

const cards = computed(() =>
  stats.value
    ? [
        { label: 'Customers', value: stats.value.customers, to: '/customers' },
        { label: 'Orders', value: stats.value.orders, to: '/orders' },
        { label: 'Invitations', value: stats.value.invitations, to: '/invitations' },
        { label: 'Published', value: stats.value.publishedInvitations, to: '/invitations' },
        { label: 'Total RSVPs', value: stats.value.totalRsvps, to: '/invitations' },
        { label: 'Pending wishes', value: stats.value.pendingWishes, to: '/invitations' },
      ]
    : [],
);

onMounted(async () => {
  try {
    stats.value = await api.stats();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load stats';
  }
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
    <p class="mt-1 text-sm text-slate-500">Overview of your wedding invitation business.</p>

    <p v-if="error" class="mt-6 text-sm text-red-600">{{ error }}</p>

    <div v-else class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
      <RouterLink v-for="card in cards" :key="card.label" :to="card.to" class="card transition hover:border-indigo-300">
        <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {{ card.label }}
        </p>
        <p class="mt-2 text-3xl font-bold text-slate-800">{{ card.value }}</p>
      </RouterLink>
      <div v-if="!stats" class="col-span-full py-10 text-center text-sm text-slate-400">
        Loading…
      </div>
    </div>

    <div class="card mt-8">
      <h2 class="text-sm font-semibold text-slate-700">Quick actions</h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <RouterLink class="btn-secondary btn-sm" to="/customers">+ New customer</RouterLink>
        <RouterLink class="btn-secondary btn-sm" to="/orders">+ New order</RouterLink>
        <RouterLink class="btn-secondary btn-sm" to="/invitations">+ New invitation</RouterLink>
      </div>
    </div>
  </div>
</template>
