<script setup lang="ts">
import type { AttendanceStatus, PublicInvitation } from '@invitera/shared';
import { reactive, ref } from 'vue';
import { ApiError, submitRsvp } from '../lib/api';

const props = defineProps<{ invitation: PublicInvitation }>();

const form = reactive({
  guestName: props.invitation.guest?.name ?? '',
  attendanceStatus: 'attending' as AttendanceStatus,
  paxCount: 1,
  message: '',
});
const submitting = ref(false);
const submitted = ref(false);
const error = ref<string | null>(null);

async function onSubmit() {
  error.value = null;
  if (!form.guestName.trim()) {
    error.value = 'Nama wajib diisi.';
    return;
  }
  submitting.value = true;
  try {
    await submitRsvp(props.invitation.slug, {
      guestName: form.guestName,
      attendanceStatus: form.attendanceStatus,
      paxCount: Math.max(1, Math.round(Number(form.paxCount) || 1)),
      message: form.message.trim() || undefined,
      guestSlug: props.invitation.guest?.uniqueSlug,
    });
    submitted.value = true;
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Gagal mengirim konfirmasi. Coba lagi.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="invite-card mx-auto w-full max-w-md">
    <Transition name="fade" mode="out-in">
      <div v-if="submitted" class="py-6 text-center">
        <p class="text-3xl">🎉</p>
        <h3 class="mt-2 font-semibold">Terima kasih!</h3>
        <p class="mt-1 text-sm text-stone-500">Konfirmasi kehadiran Anda sudah kami terima.</p>
      </div>

      <form v-else class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="invite-label" for="rsvp-name">Nama</label>
          <input
            id="rsvp-name"
            v-model="form.guestName"
            class="invite-input"
            type="text"
            maxlength="120"
            placeholder="Nama Anda"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="invite-label" for="rsvp-status">Kehadiran</label>
            <select id="rsvp-status" v-model="form.attendanceStatus" class="invite-input">
              <option value="attending">Hadir</option>
              <option value="not_attending">Berhalangan</option>
              <option value="tentative">Belum Pasti</option>
            </select>
          </div>
          <div>
            <label class="invite-label" for="rsvp-pax">Jumlah Tamu</label>
            <input
              id="rsvp-pax"
              v-model.number="form.paxCount"
              class="invite-input"
              type="number"
              min="1"
              max="50"
              :disabled="form.attendanceStatus === 'not_attending'"
            />
          </div>
        </div>
        <div>
          <label class="invite-label" for="rsvp-message">Pesan (opsional)</label>
          <textarea
            id="rsvp-message"
            v-model="form.message"
            class="invite-input"
            rows="3"
            maxlength="500"
            placeholder="Pesan untuk mempelai"
          />
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <button class="invite-btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Mengirim…' : 'Kirim Konfirmasi' }}
        </button>
      </form>
    </Transition>
  </div>
</template>
