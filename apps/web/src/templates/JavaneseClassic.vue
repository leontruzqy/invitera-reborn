<script setup lang="ts">
import { parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import CountdownTimer from '../components/CountdownTimer.vue';
import RsvpForm from '../components/RsvpForm.vue';
import WishesSection from '../components/WishesSection.vue';
import { formatEventDate } from '../lib/format';

const props = defineProps<{ invitation: PublicInvitation }>();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));
const accent = computed(() => theme.value.accent ?? '#92400e');
const heroImage = computed(
  () => theme.value.coverImageUrl ?? props.invitation.media[0]?.url ?? null,
);
const gallery = computed(() => props.invitation.media.filter((m) => m.type === 'image'));
</script>

<template>
  <main class="min-h-screen bg-amber-50 text-stone-800" :style="{ '--accent': accent }">
    <div class="batik-border" />

    <Transition name="rise" appear>
      <section class="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center">
        <p class="font-serif text-2xl tracking-[0.2em]" :style="{ color: accent }">꧁</p>
        <p class="mt-4 font-serif text-xl tracking-[0.25em] uppercase" :style="{ color: accent }">
          Sugeng Rawuh
        </p>
        <p class="mt-3 text-xs tracking-[0.3em] uppercase opacity-60">
          Ing Pawiwahan Dhaupipun
        </p>
        <h1 class="mt-10 font-serif text-5xl sm:text-6xl" :style="{ color: accent }">
          {{ invitation.brideName }}
        </h1>
        <p class="my-3 font-serif text-2xl opacity-60">kaliyan</p>
        <h1 class="font-serif text-5xl sm:text-6xl" :style="{ color: accent }">
          {{ invitation.groomName }}
        </h1>
        <p class="mt-8 text-sm font-medium opacity-80">
          {{ formatEventDate(invitation.eventDate) }}
        </p>
        <p class="mt-6 font-serif text-2xl" :style="{ color: accent }">꧂</p>
      </section>
    </Transition>

    <section v-if="heroImage" class="mx-auto max-w-2xl px-6 pb-12 animate-fade-up">
      <div class="rounded-t-full border-4 p-2" :style="{ borderColor: accent }">
        <img :src="heroImage" alt="" class="aspect-[3/4] w-full rounded-t-full object-cover" />
      </div>
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-12 text-center">
      <div class="rounded-2xl border-2 bg-white/70 p-8" :style="{ borderColor: accent }">
        <h2 class="font-serif text-xl tracking-[0.2em] uppercase" :style="{ color: accent }">
          Ngetang Dinten
        </h2>
        <div class="mt-6" :style="{ color: accent }">
          <CountdownTimer :date="invitation.eventDate" />
        </div>
      </div>
    </section>

    <section class="bg-stone-900 px-6 py-14 text-center text-amber-50">
      <div class="mx-auto max-w-xl space-y-4">
        <p class="font-serif text-2xl text-amber-200">Papan &amp; Wekdal</p>
        <p class="text-lg font-semibold">{{ invitation.venueName ?? 'Lokasi menyusul' }}</p>
        <p v-if="invitation.venueAddress" class="text-sm text-amber-100/70">
          {{ invitation.venueAddress }}
        </p>
        <p class="text-sm font-medium text-amber-100">
          {{ formatEventDate(invitation.eventDate, true) }}
        </p>
        <a
          v-if="invitation.mapsUrl"
          :href="invitation.mapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-2 inline-block rounded-full border border-amber-200 px-7 py-2.5 text-sm text-amber-200 transition hover:bg-amber-200 hover:text-stone-900"
        >
          Pirsani Peta
        </a>
      </div>
    </section>

    <section v-if="gallery.length > 1" class="mx-auto max-w-2xl px-6 py-12">
      <div class="grid grid-cols-2 gap-3">
        <img
          v-for="item in gallery"
          :key="item.id"
          :src="item.url"
          :alt="item.altText ?? ''"
          class="aspect-square w-full rounded-xl border-2 object-cover"
          :style="{ borderColor: accent }"
          loading="lazy"
        />
      </div>
    </section>

    <section class="mx-auto max-w-2xl px-6 py-12 text-center">
      <h2 class="font-serif text-xl tracking-[0.2em] uppercase" :style="{ color: accent }">
        Konfirmasi Rawuh
      </h2>
      <div class="mt-6">
        <RsvpForm :invitation="invitation" />
      </div>
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-14 text-center">
      <h2 class="font-serif text-xl tracking-[0.2em] uppercase" :style="{ color: accent }">
        Atur Pangestu
      </h2>
      <div class="mt-6">
        <WishesSection :invitation="invitation" />
      </div>
    </section>

    <footer class="pb-6 text-center text-xs opacity-60">
      {{ invitation.brideName }} &amp; {{ invitation.groomName }} · Dibuat dengan Invitera
    </footer>
    <div class="batik-border" />
  </main>
</template>

<style scoped>
/* Simple batik-inspired stripe band using only CSS */
.batik-border {
  height: 14px;
  background: repeating-linear-gradient(
    45deg,
    var(--accent, #92400e) 0 10px,
    #fbbf24 10px 14px,
    #1c1917 14px 24px,
    #fbbf24 24px 28px
  );
}
</style>
