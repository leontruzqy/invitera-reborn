<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{ date: string | null }>();

const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
onBeforeUnmount(() => clearInterval(timer));

const units = computed(() => {
  if (!props.date) return null;
  const diff = new Date(props.date).getTime() - now.value;
  if (diff <= 0) return null;
  return [
    { label: 'Hari', value: Math.floor(diff / 86_400_000) },
    { label: 'Jam', value: Math.floor(diff / 3_600_000) % 24 },
    { label: 'Menit', value: Math.floor(diff / 60_000) % 60 },
    { label: 'Detik', value: Math.floor(diff / 1000) % 60 },
  ];
});
</script>

<template>
  <div v-if="units" class="flex justify-center gap-3">
    <div
      v-for="unit in units"
      :key="unit.label"
      class="flex w-16 flex-col items-center rounded-xl border border-current/20 px-2 py-3"
    >
      <span class="text-2xl font-semibold tabular-nums">{{ unit.value }}</span>
      <span class="text-[10px] tracking-widest uppercase opacity-70">{{ unit.label }}</span>
    </div>
  </div>
  <p v-else class="text-sm tracking-widest uppercase opacity-70">Hari bahagia telah tiba</p>
</template>
