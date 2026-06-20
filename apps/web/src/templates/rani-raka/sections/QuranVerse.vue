<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import Divider from './Divider.vue';

defineProps<{ invitation: PublicInvitation }>();

const BISMILLAH = 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ';
</script>

<template>
  <section class="block deep center" data-screen-label="Pembuka">
    <div class="reveal"><p class="arabic bismillah">{{ BISMILLAH }}</p></div>
    <div v-if="invitation.openingGreeting" class="reveal d1">
      <span class="eyebrow">{{ invitation.openingGreeting }}</span>
    </div>
    <p class="reveal d1 lead" style="margin-top: 14px">
      Dengan memohon rahmat dan ridho Allah Subhanahu wa Ta'ala, kami bermaksud
      menyelenggarakan pernikahan putra-putri kami.
    </p>
    <Divider />
    <div v-if="invitation.verseArabic || invitation.verseTranslation" class="reveal d1 verse-card">
      <p v-if="invitation.verseArabic" class="arabic verse-ar">{{ invitation.verseArabic }}</p>
      <p v-if="invitation.verseTranslation" class="verse-tr">{{ invitation.verseTranslation }}</p>
      <p v-if="invitation.verseReference" class="verse-ref">{{ invitation.verseReference }}</p>
    </div>
  </section>
</template>
