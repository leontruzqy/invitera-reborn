<script setup lang="ts">
import { parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import CountdownTimer from '../components/CountdownTimer.vue';
import RsvpForm from '../components/RsvpForm.vue';
import WishesSection from '../components/WishesSection.vue';
import { formatEventDate } from '../lib/format';

const props = defineProps<{ invitation: PublicInvitation }>();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));
const accent = computed(() => theme.value.accent ?? '#047857');
const heroImage = computed(
  () => theme.value.coverImageUrl ?? props.invitation.media[0]?.url ?? null,
);
const gallery = computed(() => props.invitation.media.filter((m) => m.type === 'image'));
</script>

<template>
  <main class="min-h-screen bg-white text-stone-800" :style="{ '--accent': accent }">
    <Transition name="rise" appear>
      <section class="mx-auto max-w-3xl px-6 pt-20 pb-14 text-center">
        <p class="font-serif text-2xl" :style="{ color: accent }">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </p>
        <p class="mt-4 text-sm font-medium opacity-70">
          Assalamu'alaikum Warahmatullahi Wabarakatuh
        </p>
        <p class="mt-10 text-xs tracking-[0.35em] uppercase opacity-50">Walimatul 'Ursy</p>
        <h1 class="mt-6 font-serif text-5xl sm:text-6xl" :style="{ color: accent }">
          {{ invitation.brideName }}
        </h1>
        <p class="my-3 text-xl opacity-50">&amp;</p>
        <h1 class="font-serif text-5xl sm:text-6xl" :style="{ color: accent }">
          {{ invitation.groomName }}
        </h1>
        <p class="mt-8 text-sm opacity-70">{{ formatEventDate(invitation.eventDate) }}</p>
        <p class="mt-8 text-lg tracking-[0.5em]" :style="{ color: accent }">✦ ✦ ✦</p>
      </section>
    </Transition>

    <section
      v-if="heroImage"
      class="mx-auto max-w-2xl px-6 pb-14 text-center animate-fade-up"
    >
      <div
        class="mx-auto overflow-hidden rounded-t-[10rem] rounded-b-3xl border-2 p-2"
        :style="{ borderColor: accent }"
      >
        <img
          :src="heroImage"
          alt=""
          class="aspect-[3/4] w-full rounded-t-[9.5rem] rounded-b-2xl object-cover"
        />
      </div>
    </section>

    <section class="px-6 pb-14 text-center">
      <div class="mx-auto max-w-xl rounded-3xl bg-emerald-50 p-8">
        <p class="text-sm leading-relaxed opacity-80">
          "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu
          dari jenismu sendiri, agar kamu merasa tenteram kepadanya."
        </p>
        <p class="mt-3 text-xs font-semibold tracking-wide" :style="{ color: accent }">
          QS. Ar-Rum: 21
        </p>
      </div>
    </section>

    <section class="px-6 pb-14 text-center">
      <h2 class="text-xs tracking-[0.35em] uppercase opacity-50">Menuju Hari H</h2>
      <div class="mt-8" :style="{ color: accent }">
        <CountdownTimer :date="invitation.eventDate" />
      </div>
    </section>

    <section class="px-6 pb-14 text-center" :style="{ backgroundColor: accent }">
      <div class="mx-auto max-w-xl space-y-4 py-14 text-white">
        <h2 class="text-xs tracking-[0.35em] uppercase opacity-80">Waktu &amp; Tempat</h2>
        <p class="font-serif text-2xl">{{ invitation.venueName ?? 'Lokasi menyusul' }}</p>
        <p v-if="invitation.venueAddress" class="text-sm opacity-80">
          {{ invitation.venueAddress }}
        </p>
        <p class="text-sm font-medium">{{ formatEventDate(invitation.eventDate, true) }}</p>
        <a
          v-if="invitation.mapsUrl"
          :href="invitation.mapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-2 inline-block rounded-full bg-white px-7 py-2.5 text-sm font-semibold transition hover:opacity-90"
          :style="{ color: accent }"
        >
          Petunjuk Lokasi
        </a>
      </div>
    </section>

    <section v-if="gallery.length > 1" class="mx-auto max-w-2xl px-6 py-14">
      <div class="grid grid-cols-2 gap-3">
        <img
          v-for="item in gallery"
          :key="item.id"
          :src="item.url"
          :alt="item.altText ?? ''"
          class="aspect-square w-full rounded-2xl object-cover"
          loading="lazy"
        />
      </div>
    </section>

    <section class="bg-emerald-50/60 px-6 py-14 text-center">
      <h2 class="text-xs tracking-[0.35em] uppercase opacity-50">Konfirmasi Kehadiran</h2>
      <div class="mt-8">
        <RsvpForm :invitation="invitation" />
      </div>
    </section>

    <section class="px-6 py-14 text-center">
      <h2 class="text-xs tracking-[0.35em] uppercase opacity-50">Ucapan &amp; Doa</h2>
      <div class="mt-8">
        <WishesSection :invitation="invitation" />
      </div>
    </section>

    <footer class="pb-10 text-center text-xs opacity-50">
      Wassalamu'alaikum Warahmatullahi Wabarakatuh ·
      {{ invitation.brideName }} &amp; {{ invitation.groomName }} · Dibuat dengan Invitera
    </footer>
  </main>
</template>
