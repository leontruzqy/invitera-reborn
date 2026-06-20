<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { computed } from 'vue';
import { formatEventDate } from '../../../lib/format';
import CornerFloral from '../art/CornerFloral.vue';
import Divider from './Divider.vue';

const props = defineProps<{ invitation: PublicInvitation }>();

const meta = computed(() => {
  const parts = [props.invitation.venueAddress, formatEventDate(props.invitation.eventDate)].filter(
    Boolean,
  );
  return parts.join(' · ');
});
</script>

<template>
  <section
    v-if="invitation.venueName || invitation.mapsUrl"
    class="block cream center"
    data-screen-label="Lokasi"
  >
    <div class="corner-floral br"><CornerFloral /></div>
    <div class="reveal"><span class="eyebrow">Lokasi Acara</span></div>
    <div class="reveal d1"><h2 class="section-title">Denah Lokasi</h2></div>
    <Divider />
    <div class="reveal d1 venue-card">
      <div class="venue-map">
        <svg class="roads" viewBox="0 0 400 220" preserveAspectRatio="none">
          <g stroke="#b9c9c2" stroke-width="6" fill="none">
            <path d="M-10 60 L 410 90" />
            <path d="M40 -10 L 120 230" />
            <path d="M-10 160 L 410 150" />
            <path d="M300 -10 L 260 230" />
          </g>
          <g stroke="#cdd9d3" stroke-width="2" fill="none">
            <path d="M-10 110 L 410 120" />
            <path d="M200 -10 L 180 230" />
          </g>
        </svg>
        <div class="pin"><div class="dot"></div></div>
      </div>
      <div class="venue-info">
        <div class="vname">{{ invitation.venueName }}</div>
        <div v-if="meta" class="vaddr">{{ meta }}</div>
        <a v-if="invitation.mapsUrl" class="btn" :href="invitation.mapsUrl" target="_blank" rel="noopener">
          Lihat Peta
        </a>
      </div>
    </div>
  </section>
</template>
