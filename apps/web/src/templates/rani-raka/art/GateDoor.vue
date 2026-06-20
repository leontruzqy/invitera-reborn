<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ side: 'left' | 'right' }>();

const flip = computed(() =>
  props.side === 'right' ? 'scale(-1,1) translate(-200,0)' : '',
);
const medallions = Array.from({ length: 6 }, (_, k) => 230 + k * 135);
const lattice = Array.from({ length: 9 }, (_, k) => 200 + k * 90);
</script>

<template>
  <svg viewBox="0 0 200 1000" preserveAspectRatio="none">
    <defs>
      <linearGradient :id="`rr-door-${side}`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#0c2746" />
        <stop :offset="side === 'left' ? '1' : '0'" stop-color="#1a4a7d" />
        <stop offset="1" stop-color="#0a2038" />
      </linearGradient>
      <linearGradient :id="`rr-gold-${side}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e8cd7e" />
        <stop offset="0.5" stop-color="#caa235" />
        <stop offset="1" stop-color="#9a7a1f" />
      </linearGradient>
    </defs>
    <g :transform="flip">
      <rect x="0" y="0" width="200" height="1000" :fill="`url(#rr-door-${side})`" />
      <rect
        x="6"
        y="6"
        width="190"
        height="988"
        fill="none"
        :stroke="`url(#rr-gold-${side})`"
        stroke-width="3"
        opacity="0.9"
      />
      <rect
        x="18"
        y="18"
        width="178"
        height="964"
        fill="none"
        stroke="#caa235"
        stroke-width="1"
        opacity="0.5"
      />
      <path
        d="M196 120 C 120 120, 70 70, 70 0"
        fill="none"
        :stroke="`url(#rr-gold-${side})`"
        stroke-width="3"
      />
      <path
        d="M196 150 C 130 150, 96 100, 96 0"
        fill="none"
        stroke="#caa235"
        stroke-width="1.4"
        opacity="0.6"
      />
      <g v-for="(cy, k) in medallions" :key="k" :transform="`translate(150 ${cy})`" opacity="0.92">
        <path
          d="M0 -40 C 26 -22, 26 22, 0 40 C -26 22, -26 -22, 0 -40 Z"
          fill="none"
          stroke="#caa235"
          stroke-width="1.6"
        />
        <circle r="9" fill="none" :stroke="`url(#rr-gold-${side})`" stroke-width="2" />
        <circle r="3" fill="#caa235" />
        <path d="M0 -40 L0 -64 M0 40 L0 60" stroke="#caa235" stroke-width="1.2" opacity="0.6" />
      </g>
      <g transform="translate(150 540)">
        <circle r="22" fill="none" :stroke="`url(#rr-gold-${side})`" stroke-width="4" />
        <circle r="22" cx="0" cy="22" fill="none" stroke="#caa235" stroke-width="2" opacity="0.5" />
      </g>
      <g stroke="#1f6fa8" stroke-width="0.7" opacity="0.25">
        <line v-for="(y, k) in lattice" :key="k" x1="30" :y1="y" x2="120" :y2="y" />
      </g>
    </g>
  </svg>
</template>
