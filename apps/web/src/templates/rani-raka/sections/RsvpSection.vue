<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { reactive, ref } from 'vue';
import { formatEventDate } from '../../../lib/format';
import { ApiError, submitRsvp, submitWish } from '../../../lib/api';

const props = defineProps<{ invitation: PublicInvitation }>();

const form = reactive({
  guestName: props.invitation.guest?.name ?? '',
  attending: 'yes' as 'yes' | 'no',
  pax: 1,
  message: '',
});

const sent = ref(false);
const submitting = ref(false);
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
      guestName: form.guestName.trim(),
      attendanceStatus: form.attending === 'yes' ? 'attending' : 'not_attending',
      paxCount: form.attending === 'yes' ? Math.max(1, Math.round(Number(form.pax) || 1)) : 1,
      message: form.message.trim() || undefined,
      guestSlug: props.invitation.guest?.uniqueSlug,
    });
    // The Ucapan/doa doubles as a public wish (held for moderation).
    if (form.message.trim()) {
      await submitWish(props.invitation.slug, {
        guestName: form.guestName.trim(),
        message: form.message.trim(),
      }).catch(() => {});
    }
    sent.value = true;
  } catch (err) {
    error.value =
      err instanceof ApiError ? err.message : 'Gagal mengirim konfirmasi. Coba lagi.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <section class="block rsvp center" data-screen-label="Konfirmasi">
    <div v-if="sent" class="thanks">
      <span class="eyebrow">Terkirim</span>
      <p class="script">Terima Kasih</p>
      <p class="lead" style="margin-top: 10px">
        Konfirmasi dan doa Anda telah kami terima. Kami menantikan kehadiran Anda.
      </p>
    </div>

    <template v-else>
      <div class="reveal"><span class="eyebrow">Konfirmasi Kehadiran</span></div>
      <div class="reveal d1"><h2 class="section-title">RSVP &amp; Ucapan</h2></div>
      <p v-if="invitation.rsvpDeadline" class="reveal d1 lead" style="margin-top: 8px">
        Mohon konfirmasi sebelum {{ formatEventDate(invitation.rsvpDeadline) }}
      </p>
      <form class="form reveal d2" @submit.prevent="onSubmit">
        <div class="field">
          <label>Nama Lengkap</label>
          <input v-model="form.guestName" required maxlength="120" placeholder="Nama Anda" />
        </div>
        <div class="field">
          <label>Apakah Anda akan hadir?</label>
          <div class="seg">
            <button
              type="button"
              :class="{ active: form.attending === 'yes' }"
              @click="form.attending = 'yes'"
            >
              Insya Allah Hadir
            </button>
            <button
              type="button"
              :class="{ active: form.attending === 'no' }"
              @click="form.attending = 'no'"
            >
              Maaf, Berhalangan
            </button>
          </div>
        </div>
        <div class="field" v-show="form.attending === 'yes'">
          <label>Jumlah Tamu</label>
          <select v-model.number="form.pax">
            <option :value="1">1 Orang</option>
            <option :value="2">2 Orang</option>
            <option :value="3">3 Orang</option>
            <option :value="4">4 Orang</option>
            <option :value="5">5+ Orang</option>
          </select>
        </div>
        <div class="field">
          <label>Ucapan &amp; Doa</label>
          <textarea
            v-model="form.message"
            rows="3"
            maxlength="500"
            placeholder="Tuliskan ucapan & doa untuk kedua mempelai…"
          />
        </div>
        <p v-if="error" style="color: #ffb4b4; font-size: 0.9rem">{{ error }}</p>
        <button class="btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Mengirim…' : 'Kirim Konfirmasi' }}
        </button>
      </form>

      <div v-if="invitation.wishes.length" class="wishes-wall reveal d2">
        <div v-for="w in invitation.wishes" :key="w.id" class="wish-card">
          <div class="wish-name">{{ w.guestName }}</div>
          <p class="wish-msg">{{ w.message }}</p>
        </div>
      </div>
    </template>
  </section>
</template>
