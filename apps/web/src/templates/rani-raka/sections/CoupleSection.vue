<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import CornerFloral from '../art/CornerFloral.vue';
import Divider from './Divider.vue';

const props = defineProps<{ invitation: PublicInvitation }>();

const bridePhoto = computed(() => props.invitation.media.find((m) => m.slot === 'bride') ?? null);
const groomPhoto = computed(() => props.invitation.media.find((m) => m.slot === 'groom') ?? null);
</script>

<template>
  <section class="block cream center" data-screen-label="Mempelai">
    <div class="corner-floral tl"><CornerFloral /></div>
    <div class="reveal"><span class="eyebrow">Kedua Mempelai</span></div>
    <div class="reveal d1"><h2 class="section-title">Putra &amp; Putri Kami</h2></div>
    <Divider />

    <div class="reveal d1 mempelai">
      <div v-if="bridePhoto" class="mp-photo">
        <img :src="bridePhoto.url" :alt="bridePhoto.altText ?? invitation.brideName" />
      </div>
      <div v-else class="mp-photo empty">Foto mempelai wanita</div>
      <h3 class="script mp-name">{{ invitation.brideName }}</h3>
      <p v-if="invitation.brideTagline" class="mp-role">{{ invitation.brideTagline }}</p>
      <p v-if="invitation.brideParents" class="mp-parents">{{ invitation.brideParents }}</p>
    </div>

    <div class="mp-amp script">&amp;</div>

    <div class="reveal d2 mempelai">
      <div v-if="groomPhoto" class="mp-photo">
        <img :src="groomPhoto.url" :alt="groomPhoto.altText ?? invitation.groomName" />
      </div>
      <div v-else class="mp-photo empty">Foto mempelai pria</div>
      <h3 class="script mp-name">{{ invitation.groomName }}</h3>
      <p v-if="invitation.groomTagline" class="mp-role">{{ invitation.groomTagline }}</p>
      <p v-if="invitation.groomParents" class="mp-parents">{{ invitation.groomParents }}</p>
    </div>
  </section>
</template>
