<script setup lang="ts">
import { parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import CountdownTimer from '../components/CountdownTimer.vue';
import RsvpForm from '../components/RsvpForm.vue';
import WishesSection from '../components/WishesSection.vue';
import { formatEventDate } from '../lib/format';

const props = defineProps<{ invitation: PublicInvitation }>();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));
const accent = computed(() => theme.value.accent ?? '#1c1917');
const heroImage = computed(
  () => theme.value.coverImageUrl ?? props.invitation.media[0]?.url ?? null,
);
const gallery = computed(() => props.invitation.media.filter((m) => m.type === 'image'));
</script>

<template>
  <main class="min-h-screen bg-white text-stone-900" :style="{ '--accent': accent }">
    <Transition name="rise" appear>
      <section class="mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 pb-16 text-center">
        <p class="text-xs tracking-[0.45em] text-stone-400 uppercase">The Wedding Of</p>
        <h1 class="mt-8 font-serif text-5xl sm:text-6xl">{{ invitation.brideName }}</h1>
        <span class="my-3 font-serif text-2xl text-stone-300">&amp;</span>
        <h1 class="font-serif text-5xl sm:text-6xl">{{ invitation.groomName }}</h1>
        <p class="mt-8 text-xs tracking-[0.3em] text-stone-500 uppercase">
          {{ formatEventDate(invitation.eventDate) }}
        </p>
        <div class="mt-10 h-px w-24" :style="{ backgroundColor: accent }" />
      </section>
    </Transition>

    <img
      v-if="heroImage"
      :src="heroImage"
      alt=""
      class="mx-auto aspect-video w-full max-w-3xl object-cover"
    />

    <section class="mx-auto max-w-3xl px-6 py-16 text-center animate-fade-up">
      <h2 class="text-xs tracking-[0.45em] text-stone-400 uppercase">Menghitung Hari</h2>
      <div class="mt-8 text-stone-800">
        <CountdownTimer :date="invitation.eventDate" />
      </div>
    </section>

    <section class="border-y border-stone-200 bg-stone-50 px-6 py-16 text-center">
      <div class="mx-auto max-w-xl space-y-4">
        <h2 class="text-xs tracking-[0.45em] text-stone-400 uppercase">Waktu &amp; Tempat</h2>
        <p class="font-serif text-2xl">{{ invitation.venueName ?? 'Lokasi menyusul' }}</p>
        <p v-if="invitation.venueAddress" class="text-sm text-stone-500">
          {{ invitation.venueAddress }}
        </p>
        <p class="text-sm font-medium text-stone-700">
          {{ formatEventDate(invitation.eventDate, true) }}
        </p>
        <a
          v-if="invitation.mapsUrl"
          :href="invitation.mapsUrl"
          target="_blank"
          rel="noopener"
          class="maps-btn inline-block rounded-full border px-6 py-2 text-xs tracking-[0.25em] uppercase transition"
        >
          Lihat Peta
        </a>
      </div>
    </section>

    <section v-if="gallery.length > 1" class="mx-auto max-w-3xl px-6 py-16">
      <div class="grid grid-cols-2 gap-2">
        <img
          v-for="item in gallery"
          :key="item.id"
          :src="item.url"
          :alt="item.altText ?? ''"
          class="aspect-square w-full rounded-lg object-cover"
          loading="lazy"
        />
      </div>
    </section>

    <section class="px-6 py-16 text-center">
      <h2 class="text-xs tracking-[0.45em] text-stone-400 uppercase">Konfirmasi Kehadiran</h2>
      <div class="mt-8">
        <RsvpForm :invitation="invitation" />
      </div>
    </section>

    <section class="border-t border-stone-200 bg-stone-50 px-6 py-16 text-center">
      <h2 class="text-xs tracking-[0.45em] text-stone-400 uppercase">Ucapan &amp; Doa</h2>
      <div class="mt-8">
        <WishesSection :invitation="invitation" />
      </div>
    </section>

    <footer class="py-10 text-center text-xs text-stone-400">
      {{ invitation.brideName }} &amp; {{ invitation.groomName }} · Dibuat dengan Invitera
    </footer>
  </main>
</template>

<style scoped>
.maps-btn {
  border-color: var(--accent);
  color: var(--accent);
}
.maps-btn:hover {
  background-color: var(--accent);
  color: #fff;
}
</style>
