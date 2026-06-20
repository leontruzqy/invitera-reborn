<script setup lang="ts">
import { DEFAULT_PALETTE, parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed, ref } from 'vue';
import './rani-raka/rani-raka.css';
import { useReveal } from './rani-raka/useReveal';
import HeroSection from './rani-raka/sections/HeroSection.vue';
import QuranVerse from './rani-raka/sections/QuranVerse.vue';
import CoupleSection from './rani-raka/sections/CoupleSection.vue';
import LoveStorySection from './rani-raka/sections/LoveStorySection.vue';
import CountdownSection from './rani-raka/sections/CountdownSection.vue';
import EventsSection from './rani-raka/sections/EventsSection.vue';
import LocationSection from './rani-raka/sections/LocationSection.vue';
import GallerySection from './rani-raka/sections/GallerySection.vue';
import GiftSection from './rani-raka/sections/GiftSection.vue';
import RsvpSection from './rani-raka/sections/RsvpSection.vue';
import FooterSection from './rani-raka/sections/FooterSection.vue';
import ParallaxFlock from './rani-raka/sections/ParallaxFlock.vue';

const props = defineProps<{ invitation: PublicInvitation; opened?: boolean }>();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));

const heroStyle = computed(() => (theme.value.heroStyle === 'peacock' ? 'peacock' : 'gate'));
const motion = computed(() => theme.value.motion !== false);
const birds = computed(() => theme.value.birds ?? 7);

/** Palette `[night, peacock, teal, gold]` → CSS custom properties. */
const paletteVars = computed<Record<string, string>>(() => {
  const p = theme.value.palette && theme.value.palette.length >= 4
    ? theme.value.palette
    : DEFAULT_PALETTE;
  const [night, peacock, teal, gold] = p;
  return {
    '--night': night,
    '--peacock': peacock,
    '--teal': teal,
    '--gold': gold,
  };
});

const root = ref<HTMLElement | null>(null);
useReveal(root);
</script>

<template>
  <div ref="root" class="rr-root" :class="{ 'no-motion': !motion }" :style="paletteVars">
    <ParallaxFlock :count="birds" :palette="theme.palette ?? DEFAULT_PALETTE" :motion="motion" />
    <div class="rr-page">
      <HeroSection :invitation="invitation" :variant="heroStyle" :open="!!opened" />
      <QuranVerse :invitation="invitation" />
      <CoupleSection :invitation="invitation" />
      <LoveStorySection :invitation="invitation" />
      <CountdownSection :invitation="invitation" />
      <EventsSection :invitation="invitation" />
      <LocationSection :invitation="invitation" />
      <GallerySection :invitation="invitation" />
      <GiftSection :invitation="invitation" />
      <RsvpSection :invitation="invitation" />
      <FooterSection :invitation="invitation" />
    </div>
  </div>
</template>
