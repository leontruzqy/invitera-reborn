<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ fan?: number }>(), { fan: 11 });

interface FeatherSpec {
  angle: number;
  len: number;
  delay: string;
}

const feathers = computed<FeatherSpec[]>(() => {
  const spread = 116; // total degrees
  const fan = props.fan;
  return Array.from({ length: fan }, (_, i) => {
    const t = fan === 1 ? 0.5 : i / (fan - 1);
    return {
      angle: -spread / 2 + t * spread,
      len: 132 + Math.sin(t * Math.PI) * 60,
      delay: `${(i % 7) * -0.4}s`,
    };
  });
});

function barbs(len: number) {
  return Array.from({ length: 7 }, (_, k) => {
    const y = -len * 0.32 - k * (len * 0.07);
    const w = 10 - k * 0.6;
    return { y, w };
  });
}

const crest = Array.from({ length: 5 }, (_, k) => -36 + k * 18);
</script>

<template>
  <svg viewBox="-180 -230 360 320" aria-label="peacock">
    <g class="sway">
      <!-- fan behind -->
      <g transform="translate(0 6)">
        <g
          v-for="(f, i) in feathers"
          :key="i"
          class="shimmer"
          :style="{ animationDelay: f.delay }"
          :transform="`rotate(${f.angle})`"
        >
          <!-- stalk -->
          <path
            :d="`M0 0 C 6 ${-f.len * 0.4}, -6 ${-f.len * 0.7}, 0 ${-f.len}`"
            stroke="#1f6fa8"
            stroke-width="2.2"
            fill="none"
            opacity="0.85"
          />
          <!-- barbs -->
          <g stroke="#2fa39a" stroke-width="1.1" opacity="0.55">
            <g v-for="(b, k) in barbs(f.len)" :key="k">
              <line x1="0" :y1="b.y" :x2="-b.w" :y2="b.y - 7" />
              <line x1="0" :y1="b.y" :x2="b.w" :y2="b.y - 7" />
            </g>
          </g>
          <!-- the eye -->
          <g :transform="`translate(0 ${-f.len})`">
            <ellipse cx="0" cy="0" rx="15" ry="20" fill="#caa235" opacity="0.9" />
            <ellipse cx="0" cy="0" rx="11" ry="15" fill="#2fa39a" />
            <ellipse cx="0" cy="2" rx="8" ry="11" fill="#1f6fa8" />
            <ellipse cx="0" cy="3" rx="5" ry="7.5" fill="#0d2b4e" />
            <ellipse cx="-1.5" cy="1" rx="1.8" ry="2.6" fill="#e8cd7e" opacity="0.9" />
          </g>
        </g>
      </g>
      <!-- body -->
      <g>
        <ellipse cx="0" cy="24" rx="26" ry="40" fill="#13476b" />
        <ellipse cx="0" cy="10" rx="17" ry="24" fill="#1f6fa8" />
        <path d="M0 -8 C -4 -34, -4 -52, 0 -62 C 4 -52, 4 -34, 0 -8 Z" fill="#0d2b4e" />
        <circle cx="0" cy="-64" r="11" fill="#123a63" />
        <path d="M0 -60 l 12 5 l -12 4 Z" fill="#caa235" />
        <circle cx="-3" cy="-66" r="2.2" fill="#e8cd7e" />
        <g v-for="(a, k) in crest" :key="k" :transform="`rotate(${a}) translate(0 -74)`">
          <line x1="0" y1="0" x2="0" y2="-14" stroke="#2fa39a" stroke-width="1.6" />
          <circle cx="0" cy="-16" r="3" fill="#caa235" />
        </g>
      </g>
    </g>
  </svg>
</template>
