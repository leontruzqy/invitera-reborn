<script setup lang="ts">
import { type PublicInvitation } from '@invitera/shared';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import CoverOverlay from '../components/CoverOverlay.vue';
import { ApiError, fetchInvitation } from '../lib/api';
import { prefersReducedMotion } from '../composables/useSmoothScroll';
import { fallbackTemplate, templateRegistry } from '../templates/registry';

const route = useRoute();

const invitation = ref<PublicInvitation | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);
const opened = ref(false);
const coverGone = ref(false);

const SelectedTemplate = computed(() =>
  invitation.value
    ? (templateRegistry[invitation.value.templateKey] ?? fallbackTemplate)
    : null,
);

// Opening the cover starts the hero gate animation; once the cover has slid
// away (1.2s, matching the design) we unmount it so scrolling is unblocked.
function handleOpen() {
  if (opened.value) return;
  opened.value = true;
  const delay = prefersReducedMotion() ? 0 : 1200;
  setTimeout(() => (coverGone.value = true), delay);
}

onMounted(async () => {
  const slug = String(route.params.slug ?? '');
  const guestSlug = typeof route.query.guest === 'string' ? route.query.guest : undefined;
  try {
    invitation.value = await fetchInvitation(slug, guestSlug);
    document.title = `${invitation.value.brideName} & ${invitation.value.groomName} — Undangan Pernikahan`;
  } catch (err) {
    error.value =
      err instanceof ApiError && err.status === 404
        ? 'Undangan tidak ditemukan atau belum dipublikasikan.'
        : 'Terjadi kesalahan saat memuat undangan. Coba beberapa saat lagi.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div :class="['min-h-screen', !coverGone && invitation ? 'h-screen overflow-hidden' : '']">
    <div v-if="loading" class="flex min-h-screen items-center justify-center bg-stone-100">
      <p class="animate-pulse text-xs tracking-[0.3em] text-stone-400 uppercase">
        Memuat undangan…
      </p>
    </div>

    <div
      v-else-if="error"
      class="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-100 px-6 text-center"
    >
      <h1 class="font-serif text-3xl text-stone-700">Maaf</h1>
      <p class="max-w-sm text-stone-500">{{ error }}</p>
      <RouterLink to="/" class="mt-2 text-sm text-stone-400 underline">
        Kembali ke beranda
      </RouterLink>
    </div>

    <component
      v-else-if="invitation"
      :is="SelectedTemplate"
      :invitation="invitation"
      :opened="opened"
    />

    <CoverOverlay
      v-if="invitation && !coverGone"
      :invitation="invitation"
      :gone="opened"
      @open="handleOpen"
    />
  </div>
</template>
