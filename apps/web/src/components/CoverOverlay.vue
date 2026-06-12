<script setup lang="ts">
import { parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import { formatEventDate } from '../lib/format';

const props = defineProps<{ invitation: PublicInvitation }>();
const emit = defineEmits<{ open: [] }>();

const coverImage = computed(() => {
  const theme = parseThemeConfig(props.invitation.themeConfigJson);
  return theme.coverImageUrl ?? props.invitation.media[0]?.url ?? null;
});

const guestName = computed(() => props.invitation.guest?.name ?? null);
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-stone-950 px-6 text-center text-white"
  >
    <img
      v-if="coverImage"
      :src="coverImage"
      alt=""
      class="absolute inset-0 h-full w-full object-cover opacity-40"
    />
    <div class="relative flex flex-col items-center">
      <p class="text-xs tracking-[0.4em] text-white/70 uppercase animate-fade-up">The Wedding Of</p>
      <h1 class="mt-5 font-serif text-4xl sm:text-5xl animate-fade-up" style="animation-delay: 0.15s">
        {{ invitation.brideName }}
        <span class="text-white/60">&amp;</span>
        {{ invitation.groomName }}
      </h1>
      <p class="mt-4 text-sm text-white/70 animate-fade-up" style="animation-delay: 0.3s">
        {{ formatEventDate(invitation.eventDate) }}
      </p>
      <div v-if="guestName" class="mt-8 animate-fade-up" style="animation-delay: 0.45s">
        <p class="text-xs text-white/60">Kepada Yth. Bapak/Ibu/Saudara/i</p>
        <p class="mt-1 text-lg font-medium">{{ guestName }}</p>
      </div>
      <button
        type="button"
        class="mt-10 rounded-full border border-white/40 bg-white/10 px-8 py-3 text-xs tracking-[0.25em] uppercase backdrop-blur transition hover:bg-white/25 animate-fade-up animate-float-slow"
        style="animation-delay: 0.6s"
        @click="emit('open')"
      >
        Buka Undangan
      </button>
    </div>
  </div>
</template>
