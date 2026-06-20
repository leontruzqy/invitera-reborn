<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';

const props = defineProps<{ invitation: PublicInvitation }>();

const brideShort = computed(
  () => props.invitation.brideShortName || props.invitation.brideName,
);
const groomShort = computed(
  () => props.invitation.groomShortName || props.invitation.groomName,
);
</script>

<template>
  <footer class="foot" data-screen-label="Penutup">
    <p v-if="invitation.closingMessage" class="reveal lead">{{ invitation.closingMessage }}</p>
    <p class="ft-sub" style="margin-top: 24px">
      Wassalamu'alaikum Warahmatullahi Wabarakatuh
    </p>
    <p class="script">{{ brideShort }} &amp; {{ groomShort }}</p>
    <p class="ft-sub">Kami yang berbahagia</p>
    <p v-if="invitation.hashtag" class="hashtag">{{ invitation.hashtag }}</p>
  </footer>
</template>
