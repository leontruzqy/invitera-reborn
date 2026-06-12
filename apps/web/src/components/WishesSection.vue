<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { reactive, ref } from 'vue';
import { ApiError, submitWish } from '../lib/api';

const props = defineProps<{ invitation: PublicInvitation }>();

const form = reactive({
  guestName: props.invitation.guest?.name ?? '',
  message: '',
});
const submitting = ref(false);
const notice = ref<string | null>(null);
const error = ref<string | null>(null);

async function onSubmit() {
  error.value = null;
  notice.value = null;
  if (!form.guestName.trim() || !form.message.trim()) {
    error.value = 'Nama dan ucapan wajib diisi.';
    return;
  }
  submitting.value = true;
  try {
    await submitWish(props.invitation.slug, {
      guestName: form.guestName,
      message: form.message,
    });
    notice.value = 'Terima kasih! Ucapan Anda akan tampil setelah dimoderasi.';
    form.message = '';
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Gagal mengirim ucapan. Coba lagi.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-md space-y-6">
    <div class="invite-card">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="invite-label" for="wish-name">Nama</label>
          <input
            id="wish-name"
            v-model="form.guestName"
            class="invite-input"
            type="text"
            maxlength="120"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label class="invite-label" for="wish-message">Ucapan &amp; Doa</label>
          <textarea
            id="wish-message"
            v-model="form.message"
            class="invite-input"
            rows="3"
            maxlength="500"
            placeholder="Tulis ucapan dan doa terbaik Anda"
          />
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        <Transition name="fade">
          <p v-if="notice" class="text-sm text-emerald-600">{{ notice }}</p>
        </Transition>
        <button class="invite-btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Mengirim…' : 'Kirim Ucapan' }}
        </button>
      </form>
    </div>

    <TransitionGroup
      v-if="invitation.wishes.length"
      name="fade"
      tag="ul"
      class="space-y-3 text-left"
    >
      <li
        v-for="wish in invitation.wishes"
        :key="wish.id"
        class="rounded-xl bg-white p-4 text-stone-800 shadow"
      >
        <p class="text-sm font-semibold">{{ wish.guestName }}</p>
        <p class="mt-1 text-sm text-stone-600">{{ wish.message }}</p>
      </li>
    </TransitionGroup>
    <p v-else class="text-sm opacity-70">Belum ada ucapan — jadilah yang pertama!</p>
  </div>
</template>
