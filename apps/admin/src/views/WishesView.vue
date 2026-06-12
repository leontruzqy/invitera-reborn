<script setup lang="ts">
import type { Wish, WishStatus } from '@invitera/shared';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api, ApiError, type InvitationDetail } from '../lib/api';
import { formatDateTime } from '../lib/format';

const route = useRoute();
const invitationId = Number(route.params.id);

const invitation = ref<InvitationDetail | null>(null);
const wishes = ref<Wish[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filter = ref<WishStatus | 'all'>('all');
const updatingId = ref<number | null>(null);

const filters: Array<WishStatus | 'all'> = ['all', 'pending', 'approved', 'rejected'];

const statusBadge: Record<WishStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-red-50 text-red-500',
};

const visible = computed(() =>
  filter.value === 'all' ? wishes.value : wishes.value.filter((w) => w.status === filter.value),
);

const pendingCount = computed(() => wishes.value.filter((w) => w.status === 'pending').length);

onMounted(async () => {
  try {
    const [detail, list] = await Promise.all([
      api.invitations.get(invitationId),
      api.invitations.wishes(invitationId),
    ]);
    invitation.value = detail;
    wishes.value = list;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load wishes';
  } finally {
    loading.value = false;
  }
});

async function setStatus(wish: Wish, status: WishStatus) {
  updatingId.value = wish.id;
  error.value = null;
  try {
    const updated = await api.wishes.setStatus(wish.id, status);
    const index = wishes.value.findIndex((w) => w.id === wish.id);
    if (index !== -1) wishes.value[index] = updated;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to update wish';
  } finally {
    updatingId.value = null;
  }
}
</script>

<template>
  <div>
    <RouterLink :to="`/invitations/${invitationId}`" class="text-xs text-slate-400 hover:text-slate-600">
      ← Back to invitation
    </RouterLink>
    <h1 class="mt-1 text-2xl font-bold text-slate-800">
      Wishes moderation
      <span v-if="pendingCount" class="badge ml-2 bg-amber-50 align-middle text-amber-700">
        {{ pendingCount }} pending
      </span>
    </h1>
    <p v-if="invitation" class="mt-1 text-sm text-slate-500">
      {{ invitation.brideName }} &amp; {{ invitation.groomName }} ·
      <span class="font-mono text-xs">/{{ invitation.slug }}</span> · only
      <strong>approved</strong> wishes are shown on the public page.
    </p>

    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

    <div class="mt-6 flex gap-2">
      <button
        v-for="item in filters"
        :key="item"
        type="button"
        class="rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition"
        :class="
          filter === item
            ? 'bg-indigo-600 text-white'
            : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
        "
        @click="filter = item"
      >
        {{ item }}
      </button>
    </div>

    <div v-if="loading" class="py-16 text-center text-sm text-slate-400">Loading…</div>
    <p v-else-if="visible.length === 0" class="py-16 text-center text-sm text-slate-400">
      No wishes here.
    </p>

    <TransitionGroup v-else name="fade" tag="div" class="mt-6 space-y-3">
      <div v-for="wish in visible" :key="wish.id" class="card flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-medium text-slate-800">{{ wish.guestName }}</p>
            <span class="badge" :class="statusBadge[wish.status]">{{ wish.status }}</span>
            <span class="text-xs text-slate-400">{{ formatDateTime(wish.createdAt) }}</span>
          </div>
          <p class="mt-2 text-sm break-words text-slate-600">{{ wish.message }}</p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button
            v-if="wish.status !== 'approved'"
            class="btn-secondary btn-sm"
            type="button"
            :disabled="updatingId === wish.id"
            @click="setStatus(wish, 'approved')"
          >
            ✓ Approve
          </button>
          <button
            v-if="wish.status !== 'rejected'"
            class="btn-danger btn-sm"
            type="button"
            :disabled="updatingId === wish.id"
            @click="setStatus(wish, 'rejected')"
          >
            ✕ Reject
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
