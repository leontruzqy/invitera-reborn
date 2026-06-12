import type { AuthUser } from '@invitera/shared';
import { ref } from 'vue';

const TOKEN_KEY = 'invitera_admin_token';

export const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
export const currentUser = ref<AuthUser | null>(null);

export function setToken(value: string | null) {
  token.value = value;
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return token.value !== null;
}

export function logout() {
  setToken(null);
  currentUser.value = null;
}
