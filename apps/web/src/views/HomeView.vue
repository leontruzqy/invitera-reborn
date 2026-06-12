<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-stone-950 px-6 text-center text-white">
    <p class="text-xs tracking-[0.5em] text-stone-400 uppercase animate-fade-up">Invitera</p>
    <h1
      class="mt-6 max-w-xl font-serif text-4xl leading-tight sm:text-5xl animate-fade-up"
      style="animation-delay: 0.15s"
    >
      Undangan pernikahan digital yang berkesan
    </h1>
    <p class="mt-4 max-w-md text-sm text-stone-400 animate-fade-up" style="animation-delay: 0.3s">
      Setiap undangan dibuat khusus dan diakses melalui tautan pribadi yang dibagikan oleh
      mempelai.
    </p>
    <RouterLink
      to="/aisyah-raka"
      class="mt-10 rounded-full border border-white/30 px-8 py-3 text-xs tracking-widest uppercase transition hover:bg-white hover:text-stone-900 animate-fade-up"
      style="animation-delay: 0.45s"
    >
      Lihat Contoh Undangan
    </RouterLink>
  </main>
</template>
