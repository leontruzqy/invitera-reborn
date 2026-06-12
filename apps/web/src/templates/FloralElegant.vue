<script setup lang="ts">
import { parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import CountdownTimer from '../components/CountdownTimer.vue';
import RsvpForm from '../components/RsvpForm.vue';
import WishesSection from '../components/WishesSection.vue';
import { formatEventDate } from '../lib/format';

const props = defineProps<{ invitation: PublicInvitation }>();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));
const accent = computed(() => theme.value.accent ?? '#be123c');
const heroImage = computed(
  () => theme.value.coverImageUrl ?? props.invitation.media[0]?.url ?? null,
);
const gallery = computed(() => props.invitation.media.filter((m) => m.type === 'image'));
</script>

<template>
  <main class="min-h-screen bg-rose-50 text-stone-800" :style="{ '--accent': accent }">
    <Transition name="rise" appear>
      <section class="relative mx-auto max-w-3xl px-6 pt-20 pb-14 text-center">
        <p class="text-5xl animate-float-slow">🌸</p>
        <p class="mt-6 font-serif text-sm tracking-[0.3em] uppercase opacity-60">
          Undangan Pernikahan
        </p>
        <h1 class="mt-6 font-serif text-5xl italic sm:text-6xl" :style="{ color: accent }">
          {{ invitation.brideName }}
        </h1>
        <p class="my-2 font-serif text-3xl italic opacity-50">dan</p>
        <h1 class="font-serif text-5xl italic sm:text-6xl" :style="{ color: accent }">
          {{ invitation.groomName }}
        </h1>
        <p class="mt-8 text-sm opacity-70">{{ formatEventDate(invitation.eventDate) }}</p>
        <p class="mt-6 text-2xl tracking-[0.6em]">🌷🌿🌷</p>
      </section>
    </Transition>

    <section v-if="heroImage" class="mx-auto max-w-2xl px-6 pb-14 animate-fade-up">
      <img
        :src="heroImage"
        alt=""
        class="aspect-[4/3] w-full rounded-[2.5rem] border-8 border-white object-cover shadow-xl"
      />
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-14 text-center">
      <div class="rounded-[2.5rem] bg-white/80 p-10 shadow-sm backdrop-blur">
        <h2 class="font-serif text-2xl italic" :style="{ color: accent }">Menanti Hari Bahagia</h2>
        <div class="mt-8" :style="{ color: accent }">
          <CountdownTimer :date="invitation.eventDate" />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-14 text-center">
      <div class="rounded-[2.5rem] bg-white p-10 shadow-sm">
        <p class="text-3xl">💐</p>
        <h2 class="mt-4 font-serif text-2xl italic" :style="{ color: accent }">Akad &amp; Resepsi</h2>
        <p class="mt-5 text-lg font-semibold">{{ invitation.venueName ?? 'Lokasi menyusul' }}</p>
        <p v-if="invitation.venueAddress" class="mt-2 text-sm opacity-70">
          {{ invitation.venueAddress }}
        </p>
        <p class="mt-3 text-sm font-medium">{{ formatEventDate(invitation.eventDate, true) }}</p>
        <a
          v-if="invitation.mapsUrl"
          :href="invitation.mapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-6 inline-block rounded-full px-7 py-2.5 text-sm font-medium text-white shadow transition hover:opacity-90"
          :style="{ backgroundColor: accent }"
        >
          Buka di Google Maps
        </a>
      </div>
    </section>

    <section v-if="gallery.length > 1" class="mx-auto max-w-2xl px-6 pb-14">
      <div class="grid grid-cols-2 gap-4">
        <img
          v-for="item in gallery"
          :key="item.id"
          :src="item.url"
          :alt="item.altText ?? ''"
          class="aspect-square w-full rounded-3xl border-4 border-white object-cover shadow"
          loading="lazy"
        />
      </div>
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-14 text-center">
      <h2 class="font-serif text-2xl italic" :style="{ color: accent }">Konfirmasi Kehadiran</h2>
      <div class="mt-6">
        <RsvpForm :invitation="invitation" />
      </div>
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-16 text-center">
      <h2 class="font-serif text-2xl italic" :style="{ color: accent }">Ucapan &amp; Doa</h2>
      <div class="mt-6">
        <WishesSection :invitation="invitation" />
      </div>
    </section>

    <footer class="pb-10 text-center text-xs opacity-50">
      🌸 {{ invitation.brideName }} &amp; {{ invitation.groomName }} · Dibuat dengan Invitera 🌸
    </footer>
  </main>
</template>
