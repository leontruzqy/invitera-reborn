<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import Divider from './Divider.vue';

const props = defineProps<{ invitation: PublicInvitation }>();

const photos = computed(() =>
  props.invitation.media.filter((m) => m.slot === 'gallery' && m.type === 'image'),
);

// First and fifth cells are tall in the design's masonry grid.
function isTall(index: number) {
  return index % 4 === 0;
}
</script>

<template>
  <section v-if="photos.length" class="block deep center" data-screen-label="Galeri">
    <div class="reveal"><span class="eyebrow">Galeri</span></div>
    <div class="reveal d1"><h2 class="section-title">Momen Kami</h2></div>
    <Divider />
    <div class="reveal d1 gallery-grid">
      <div
        v-for="(photo, i) in photos"
        :key="photo.id"
        class="g-cell"
        :class="{ 'g-tall': isTall(i) }"
        :style="{ height: isTall(i) ? '320px' : '155px' }"
      >
        <img :src="photo.url" :alt="photo.altText ?? 'Foto'" loading="lazy" />
      </div>
    </div>
  </section>
</template>
