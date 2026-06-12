<script setup lang="ts">
import { parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import CountdownTimer from '../components/CountdownTimer.vue';
import RsvpForm from '../components/RsvpForm.vue';
import WishesSection from '../components/WishesSection.vue';
import { formatEventDate } from '../lib/format';

const props = defineProps<{ invitation: PublicInvitation }>();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));
const accent = computed(() => theme.value.accent ?? '#d4af37');
const heroImage = computed(
  () => theme.value.coverImageUrl ?? props.invitation.media[0]?.url ?? null,
);
const gallery = computed(() => props.invitation.media.filter((m) => m.type === 'image'));
</script>

<template>
  <main class="min-h-screen bg-stone-950 text-stone-100" :style="{ '--accent': accent }">
    <Transition name="rise" appear>
      <section
        class="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center"
      >
        <div
          class="absolute inset-x-10 top-16 bottom-16 rounded-[3rem] border opacity-30"
          :style="{ borderColor: accent }"
        />
        <p class="text-xs tracking-[0.5em] uppercase" :style="{ color: accent }">
          The Wedding Of
        </p>
        <h1 class="mt-8 font-serif text-5xl sm:text-7xl">{{ invitation.brideName }}</h1>
        <p class="my-4 font-serif text-3xl" :style="{ color: accent }">&amp;</p>
        <h1 class="font-serif text-5xl sm:text-7xl">{{ invitation.groomName }}</h1>
        <p class="mt-10 text-xs tracking-[0.3em] text-stone-400 uppercase">
          {{ formatEventDate(invitation.eventDate) }}
        </p>
      </section>
    </Transition>

    <section v-if="heroImage" class="mx-auto max-w-3xl px-6 pb-16 animate-fade-up">
      <div class="rounded-3xl border p-2" :style="{ borderColor: accent }">
        <img :src="heroImage" alt="" class="aspect-video w-full rounded-2xl object-cover" />
      </div>
    </section>

    <section class="px-6 pb-16 text-center">
      <h2 class="text-xs tracking-[0.5em] uppercase" :style="{ color: accent }">Counting Down</h2>
      <div class="mt-8 text-stone-100">
        <CountdownTimer :date="invitation.eventDate" />
      </div>
    </section>

    <section class="border-y border-stone-800 bg-stone-900/60 px-6 py-16 text-center">
      <div class="mx-auto max-w-xl space-y-4">
        <h2 class="text-xs tracking-[0.5em] uppercase" :style="{ color: accent }">
          Save The Date
        </h2>
        <p class="font-serif text-3xl">{{ invitation.venueName ?? 'Lokasi menyusul' }}</p>
        <p v-if="invitation.venueAddress" class="text-sm text-stone-400">
          {{ invitation.venueAddress }}
        </p>
        <p class="text-sm font-medium text-stone-200">
          {{ formatEventDate(invitation.eventDate, true) }}
        </p>
        <a
          v-if="invitation.mapsUrl"
          :href="invitation.mapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-2 inline-block rounded-full px-8 py-3 text-xs font-semibold tracking-[0.25em] text-stone-950 uppercase transition hover:opacity-90"
          :style="{ backgroundColor: accent }"
        >
          View Map
        </a>
      </div>
    </section>

    <section v-if="gallery.length > 1" class="mx-auto max-w-3xl px-6 py-16">
      <div class="grid grid-cols-2 gap-3">
        <img
          v-for="item in gallery"
          :key="item.id"
          :src="item.url"
          :alt="item.altText ?? ''"
          class="aspect-square w-full rounded-xl object-cover opacity-90 transition hover:opacity-100"
          loading="lazy"
        />
      </div>
    </section>

    <section class="px-6 py-16 text-center">
      <h2 class="text-xs tracking-[0.5em] uppercase" :style="{ color: accent }">RSVP</h2>
      <div class="mt-8">
        <RsvpForm :invitation="invitation" />
      </div>
    </section>

    <section class="border-t border-stone-800 px-6 py-16 text-center">
      <h2 class="text-xs tracking-[0.5em] uppercase" :style="{ color: accent }">
        Wishes &amp; Prayers
      </h2>
      <div class="mt-8">
        <WishesSection :invitation="invitation" />
      </div>
    </section>

    <footer class="py-10 text-center text-xs text-stone-500">
      {{ invitation.brideName }} &amp; {{ invitation.groomName }} · Dibuat dengan Invitera
    </footer>
  </main>
</template>
