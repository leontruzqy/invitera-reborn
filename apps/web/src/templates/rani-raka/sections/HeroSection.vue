<script setup lang="ts">
import type { HeroStyle, PublicInvitation } from '@invitera/shared';
import { computed, ref, watch } from 'vue';
import { formatEventDate } from '../../../lib/format';
import { prefersReducedMotion } from '../../../composables/useSmoothScroll';
import Peacock from '../art/Peacock.vue';
import GateDoor from '../art/GateDoor.vue';
import Divider from './Divider.vue';

const props = defineProps<{
  invitation: PublicInvitation;
  variant: HeroStyle;
  open: boolean;
}>();

const twinkles = Array.from({ length: 26 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3.5}s`,
  animationDuration: `${2.6 + Math.random() * 2.4}s`,
}));

const brideShort = computed(
  () => props.invitation.brideShortName || props.invitation.brideName,
);
const groomShort = computed(
  () => props.invitation.groomShortName || props.invitation.groomName,
);

// Force the open end-state if the timeline gets throttled (matches the design).
const forced = ref(false);
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (prefersReducedMotion()) {
      forced.value = true;
      return;
    }
    setTimeout(() => (forced.value = true), 3700);
  },
  { immediate: true },
);
</script>

<template>
  <header
    class="hero"
    :class="{ 'gate-open': open, 'force-open': forced }"
    data-screen-label="Hero"
  >
    <div class="twinkles">
      <span v-for="(t, i) in twinkles" :key="i" class="twinkle" :style="t" />
    </div>

    <template v-if="variant === 'peacock'">
      <div class="hero-inner">
        <div class="peacock-stage" style="width: min(86%, 340px)">
          <Peacock :fan="13" />
        </div>
        <Divider />
        <span class="eyebrow hero-eyebrow">Walimatul 'Urs</span>
        <h1 class="script hero-names">
          {{ brideShort }}<span class="amp">&amp;</span>{{ groomShort }}
        </h1>
        <p class="hero-date">{{ formatEventDate(invitation.eventDate) }}</p>
        <p v-if="invitation.venueName" class="hero-venue">{{ invitation.venueName }}</p>
      </div>
    </template>

    <template v-else>
      <div class="hero-inner">
        <div class="peacock-stage">
          <Peacock :fan="11" />
        </div>
        <span class="eyebrow hero-eyebrow">Walimatul 'Urs</span>
        <h1 class="script hero-names">
          {{ brideShort }}<span class="amp">&amp;</span>{{ groomShort }}
        </h1>
        <p class="hero-date">{{ formatEventDate(invitation.eventDate) }}</p>
        <p v-if="invitation.venueName" class="hero-venue">{{ invitation.venueName }}</p>
      </div>
      <div class="gate-wrap">
        <div class="gate-door left"><GateDoor side="left" /></div>
        <div class="gate-door right"><GateDoor side="right" /></div>
      </div>
    </template>

    <div class="scroll-cue">Geser ke bawah<span class="arrow"></span></div>
  </header>
</template>
