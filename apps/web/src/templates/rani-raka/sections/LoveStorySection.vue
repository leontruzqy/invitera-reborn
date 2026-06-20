<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { HeartIcon } from '../art/icons';
import Divider from './Divider.vue';

defineProps<{ invitation: PublicInvitation }>();
</script>

<template>
  <section
    v-if="invitation.story.length"
    class="block deep center"
    data-screen-label="Kisah Cinta"
  >
    <div class="reveal"><span class="eyebrow">Kisah Kami</span></div>
    <div class="reveal d1"><h2 class="section-title">Perjalanan Cinta</h2></div>
    <Divider />
    <div class="story-line">
      <div
        v-for="(s, i) in invitation.story"
        :key="s.id"
        class="story-step reveal"
        :class="`d${(i % 3) + 1}`"
      >
        <div class="ss-icon"><HeartIcon /></div>
        <div class="ss-body">
          <div v-if="s.whenLabel" class="ss-when">{{ s.whenLabel }}</div>
          <h3 class="ss-title">{{ s.title }}</h3>
          <p class="ss-desc">{{ s.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
