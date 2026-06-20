<script setup lang="ts">
import { DEFAULT_PALETTE, parseThemeConfig, type PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { formatEventDate } from '../lib/format';
import Peacock from '../templates/rani-raka/art/Peacock.vue';
import { EnvelopeIcon } from '../templates/rani-raka/art/icons';

const props = defineProps<{ invitation: PublicInvitation; gone?: boolean }>();
const emit = defineEmits<{ open: [] }>();

const route = useRoute();

const theme = computed(() => parseThemeConfig(props.invitation.themeConfigJson));
const paletteVars = computed<Record<string, string>>(() => {
  const p =
    theme.value.palette && theme.value.palette.length >= 4 ? theme.value.palette : DEFAULT_PALETTE;
  const [night, peacock, teal, gold] = p;
  return { '--night': night, '--peacock': peacock, '--teal': teal, '--gold': gold };
});

const brideShort = computed(
  () => props.invitation.brideShortName || props.invitation.brideName,
);
const groomShort = computed(
  () => props.invitation.groomShortName || props.invitation.groomName,
);

// Recipient: ?to= overrides, else the personalized guest, else a generic label.
const recipient = computed(() => {
  const to = typeof route.query.to === 'string' ? route.query.to.trim() : '';
  return to || props.invitation.guest?.name || 'Tamu Undangan';
});

const twinkles = Array.from({ length: 22 }, () => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 3.5}s`,
  animationDuration: `${2.6 + Math.random() * 2.4}s`,
}));
</script>

<template>
  <div class="rr-root rr-cover" :class="{ gone }" :style="paletteVars" data-screen-label="Cover">
    <div class="twinkles">
      <span v-for="(t, i) in twinkles" :key="i" class="twinkle" :style="t" />
    </div>
    <div class="cover-frame"></div>
    <div class="cover-inner">
      <span class="eyebrow hero-eyebrow">Undangan Pernikahan</span>
      <div class="cover-peacock"><Peacock :fan="9" /></div>
      <h1 class="script cover-names">
        {{ brideShort }} <span class="amp">&amp;</span> {{ groomShort }}
      </h1>
      <p class="hero-date">{{ formatEventDate(invitation.eventDate) }}</p>
      <div class="divider">
        <span class="line"></span><span class="dot">✦</span><span class="line r"></span>
      </div>
      <p class="cover-to">Kepada Yth.</p>
      <p class="cover-to-sub">Bapak / Ibu / Saudara/i</p>
      <p class="cover-recipient script">{{ recipient }}</p>
      <button class="btn solid open-btn" type="button" @click="emit('open')">
        <EnvelopeIcon /> Buka Undangan
      </button>
      <p class="cover-note">
        Mohon maaf apabila terdapat kesalahan penulisan nama &amp; gelar
      </p>
    </div>
  </div>
</template>
