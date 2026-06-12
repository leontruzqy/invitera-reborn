<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, ApiError } from '../lib/api';
import { currentUser, setToken } from '../lib/auth';

const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function onSubmit() {
  error.value = null;
  loading.value = true;
  try {
    const result = await api.login(email.value, password.value);
    setToken(result.token);
    currentUser.value = result.user;
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.push(redirect);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <p class="text-3xl">💌</p>
        <h1 class="mt-2 text-2xl font-bold text-slate-800">Invitera Admin</h1>
        <p class="mt-1 text-sm text-slate-500">Sign in to manage invitations</p>
      </div>
      <form class="card space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            class="input"
            type="email"
            required
            autocomplete="email"
            placeholder="admin@invitera.local"
          />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            class="input"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button class="btn-primary w-full" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>
