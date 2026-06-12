<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center gap-3 bg-stone-100 px-6 text-center"
  >
    <h1 class="font-serif text-5xl text-stone-700">404</h1>
    <p class="text-stone-500">Halaman yang Anda cari tidak ditemukan.</p>
    <RouterLink to="/" class="mt-2 text-sm text-stone-400 underline">Kembali ke beranda</RouterLink>
  </main>
</template>
