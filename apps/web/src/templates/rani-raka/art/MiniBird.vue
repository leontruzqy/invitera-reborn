<script setup lang="ts">
withDefaults(defineProps<{ color?: string }>(), { color: '#0d2b4e' });
</script>

<template>
  <svg viewBox="0 0 44 20" aria-hidden="true">
    <path
      d="M2 15 C 9 4, 15 4, 22 13 C 29 4, 35 4, 42 15"
      fill="none"
      :stroke="color"
      stroke-width="2.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
