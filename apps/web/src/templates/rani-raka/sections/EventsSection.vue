<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { formatEventDate } from '../../../lib/format';
import { PinIcon } from '../art/icons';
import Divider from './Divider.vue';

defineProps<{ invitation: PublicInvitation }>();
</script>

<template>
  <section v-if="invitation.events.length" class="block deep center" data-screen-label="Acara">
    <div class="reveal"><span class="eyebrow">Rangkaian Acara</span></div>
    <div class="reveal d1"><h2 class="section-title">Waktu &amp; Tempat</h2></div>
    <Divider />
    <div class="acara-grid">
      <div
        v-for="(e, i) in invitation.events"
        :key="e.id"
        class="acara-card reveal"
        :class="`d${(i % 3) + 1}`"
      >
        <div class="ac-name">{{ e.name }}</div>
        <div v-if="e.eventDate" class="ac-date">{{ formatEventDate(e.eventDate) }}</div>
        <div v-if="e.timeLabel" class="ac-time">{{ e.timeLabel }}</div>
        <div class="ac-divider"><span class="line"></span></div>
        <div v-if="e.venueName" class="ac-venue">{{ e.venueName }}</div>
        <div v-if="e.venueAddress" class="ac-addr">{{ e.venueAddress }}</div>
        <a v-if="e.mapsUrl" class="btn ac-map" :href="e.mapsUrl" target="_blank" rel="noopener">
          <PinIcon /> Lokasi
        </a>
      </div>
    </div>
  </section>
</template>
