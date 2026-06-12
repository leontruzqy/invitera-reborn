<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppLayout from './components/AppLayout.vue';
import { api } from './lib/api';
import { currentUser, isAuthenticated } from './lib/auth';

const route = useRoute();
const isPublic = computed(() => route.meta.public === true);

onMounted(async () => {
  if (isAuthenticated() && !currentUser.value) {
    try {
      currentUser.value = (await api.me()).user;
    } catch {
      // 401 is handled by the api client (redirects to /login)
    }
  }
});
</script>

<template>
  <RouterView v-if="isPublic" />
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
