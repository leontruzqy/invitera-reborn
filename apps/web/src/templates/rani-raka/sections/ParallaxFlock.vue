<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Peacock from '../art/Peacock.vue';
import MiniBird from '../art/MiniBird.vue';

const props = withDefaults(
  defineProps<{ count?: number; palette?: readonly string[]; motion?: boolean }>(),
  { count: 7, palette: () => ['#0d2b4e', '#1f6fa8', '#2fa39a', '#cda434'], motion: true },
);

interface FlockItem {
  type: 'peacock' | 'mini';
  top: number;
  left: number;
  size: number;
  speed: number;
  op: number;
  color?: string;
  flapDur: number;
  delay: number;
}

const flock = computed<FlockItem[]>(() => {
  const palette = props.palette;
  const items: FlockItem[] = [
    { type: 'peacock', top: 30, left: -8, size: 150, speed: 0.05, op: 0.12, flapDur: 0, delay: 0 },
    { type: 'peacock', top: 72, left: 64, size: 130, speed: 0.08, op: 0.1, flapDur: 0, delay: 0 },
  ];
  for (let i = 0; i < props.count; i++) {
    const dark = i % 2 === 0;
    items.push({
      type: 'mini',
      top: (i * 13 + 8) % 96,
      left: 6 + ((i * 37) % 84),
      size: 22 + (i % 3) * 12,
      speed: -0.12 - (i % 4) * 0.05,
      op: 0.32 + (i % 3) * 0.12,
      color: dark ? palette[0] : palette[3],
      flapDur: 0.9 + (i % 4) * 0.25,
      delay: -(i % 5) * 0.3,
    });
  }
  return items;
});

const layer = ref<HTMLElement | null>(null);
let raf = 0;

function update() {
  const el = layer.value;
  if (!el) return;
  const y = window.scrollY || window.pageYOffset || 0;
  el.querySelectorAll<HTMLElement>('[data-speed]').forEach((node) => {
    const sp = parseFloat(node.dataset.speed ?? '0');
    const phase = parseFloat(node.dataset.phase ?? '0');
    const dx = Math.sin(y * 0.004 + phase) * 16;
    node.style.transform = `translate3d(${dx}px, ${y * sp}px, 0)`;
  });
}

function onScroll() {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(update);
}

onMounted(() => {
  if (!props.motion || props.count === 0) return;
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <div v-if="motion && count > 0" ref="layer" class="flock" aria-hidden="true">
    <div
      v-for="(b, i) in flock"
      :key="i"
      class="flock-item"
      :data-speed="b.speed"
      :data-phase="i"
      :style="{ top: `${b.top}%`, left: `${b.left}%`, width: `${b.size}px`, opacity: b.op }"
    >
      <Peacock v-if="b.type === 'peacock'" :fan="9" />
      <div
        v-else
        class="mini-bird"
        :style="{ animationDuration: `${b.flapDur}s`, animationDelay: `${b.delay}s` }"
      >
        <MiniBird :color="b.color" />
      </div>
    </div>
  </div>
</template>
