<script setup lang="ts">
import type { AttendanceStatus, RsvpSummary } from '@invitera/shared';
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api, ApiError, type InvitationDetail, type RsvpWithGuest } from '../lib/api';
import { formatDateTime } from '../lib/format';

const route = useRoute();
const invitationId = Number(route.params.id);

const invitation = ref<InvitationDetail | null>(null);
const items = ref<RsvpWithGuest[]>([]);
const summary = ref<RsvpSummary | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const statusBadge: Record<AttendanceStatus, string> = {
  attending: 'bg-emerald-50 text-emerald-600',
  not_attending: 'bg-red-50 text-red-500',
  tentative: 'bg-amber-50 text-amber-700',
};
const statusLabel: Record<AttendanceStatus, string> = {
  attending: 'attending',
  not_attending: 'not attending',
  tentative: 'tentative',
};

onMounted(async () => {
  try {
    const [detail, result] = await Promise.all([
      api.invitations.get(invitationId),
      api.invitations.rsvps(invitationId),
    ]);
    invitation.value = detail;
    items.value = result.items;
    summary.value = result.summary;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load RSVPs';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <RouterLink :to="`/invitations/${invitationId}`" class="text-xs text-slate-400 hover:text-slate-600">
      ← Back to invitation
    </RouterLink>
    <h1 class="mt-1 text-2xl font-bold text-slate-800">RSVPs</h1>
    <p v-if="invitation" class="mt-1 text-sm text-slate-500">
      {{ invitation.brideName }} &amp; {{ invitation.groomName }} ·
      <span class="font-mono text-xs">/{{ invitation.slug }}</span>
    </p>

    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

    <div v-if="summary" class="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="card">
        <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Attending</p>
        <p class="mt-1 text-2xl font-bold text-emerald-600">{{ summary.attending }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Total pax</p>
        <p class="mt-1 text-2xl font-bold text-slate-800">{{ summary.totalPax }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Not attending</p>
        <p class="mt-1 text-2xl font-bold text-red-500">{{ summary.notAttending }}</p>
      </div>
      <div class="card">
        <p class="text-xs font-semibold tracking-wide text-slate-400 uppercase">Tentative</p>
        <p class="mt-1 text-2xl font-bold text-amber-600">{{ summary.tentative }}</p>
      </div>
    </div>

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full min-w-[720px]">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th class="th">Guest</th>
            <th class="th">Status</th>
            <th class="th">Pax</th>
            <th class="th">Message</th>
            <th class="th">Submitted</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td class="td py-8 text-center text-slate-400" colspan="5">Loading…</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td class="td py-8 text-center text-slate-400" colspan="5">No RSVPs yet.</td>
          </tr>
          <template v-else>
            <tr v-for="rsvp in items" :key="rsvp.id" class="hover:bg-slate-50">
              <td class="td">
                <span class="font-medium text-slate-800">{{ rsvp.guestName }}</span>
                <span
                  v-if="rsvp.guest"
                  class="badge ml-2 bg-indigo-50 text-indigo-600"
                  :title="`Linked guest: ${rsvp.guest.name}`"
                >
                  guest list
                </span>
              </td>
              <td class="td">
                <span class="badge" :class="statusBadge[rsvp.attendanceStatus]">
                  {{ statusLabel[rsvp.attendanceStatus] }}
                </span>
              </td>
              <td class="td">{{ rsvp.paxCount }}</td>
              <td class="td max-w-sm text-slate-500">{{ rsvp.message ?? '—' }}</td>
              <td class="td whitespace-nowrap">{{ formatDateTime(rsvp.createdAt) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
