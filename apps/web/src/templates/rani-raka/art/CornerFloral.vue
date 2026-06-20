<script setup lang="ts">
const blossom = Array.from({ length: 6 }, (_, k) => k * 60);
</script>

<template>
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <g fill="none" stroke="#caa235" stroke-width="1.5" stroke-linecap="round">
      <path d="M4 4 C 40 8, 60 20, 70 54" />
      <path d="M4 4 C 8 40, 20 60, 54 70" />
      <path
        d="M26 14 C 34 10, 44 14, 46 24 C 36 26, 28 22, 26 14 Z"
        fill="#7cc4bd"
        opacity="0.5"
        stroke="none"
      />
      <path
        d="M14 26 C 10 34, 14 44, 24 46 C 26 36, 22 28, 14 26 Z"
        fill="#7cc4bd"
        opacity="0.5"
        stroke="none"
      />
      <path
        d="M48 40 C 58 38, 66 44, 66 54 C 56 56, 48 50, 48 40 Z"
        fill="#2fa39a"
        opacity="0.45"
        stroke="none"
      />
    </g>
    <g transform="translate(70 70)">
      <ellipse
        v-for="(rot, k) in blossom"
        :key="k"
        cx="0"
        cy="-9"
        rx="5"
        ry="9"
        fill="#e0a3a3"
        opacity="0.6"
        :transform="`rotate(${rot})`"
      />
      <circle r="4" fill="#caa235" />
    </g>
  </svg>
</template>
