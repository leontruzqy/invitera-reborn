<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{ invitation: PublicInvitation }>();

const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => clearInterval(timer));

const cells = computed(() => {
  const target = props.invitation.eventDate
    ? new Date(props.invitation.eventDate).getTime()
    : now.value;
  let diff = Math.max(0, target - now.value);
  const d = Math.floor(diff / 86_400_000);
  diff -= d * 86_400_000;
  const h = Math.floor(diff / 3_600_000);
  diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000);
  diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  return [
    { label: 'Hari', value: d },
    { label: 'Jam', value: h },
    { label: 'Menit', value: m },
    { label: 'Detik', value: s },
  ];
});

function pad(n: number) {
  return String(n).padStart(2, '0');
}
</script>

<template>
  <section class="block cream center" data-screen-label="Hitung Mundur">
    <div class="reveal"><span class="eyebrow">Menghitung Hari</span></div>
    <div class="reveal d1"><h2 class="section-title">Menuju Hari Bahagia</h2></div>
    <div class="countdown">
      <div v-for="c in cells" :key="c.label" class="cd-cell">
        <div class="cd-num">{{ pad(c.value) }}</div>
        <div class="cd-lab">{{ c.label }}</div>
      </div>
    </div>
  </section>
</template>
