import type {
  AdminStats,
  AuthUser,
  Customer,
  Guest,
  Invitation,
  MediaAsset,
  Order,
  Rsvp,
  RsvpSummary,
  Wish,
  WishStatus,
} from '@invitera/shared';
import { currentUser, setToken, token } from './auth';

const API_URL: string =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token.value) headers.Authorization = `Bearer ${token.value}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401 && !path.endsWith('/login')) {
    setToken(null);
    currentUser.value = null;
    window.location.href = '/login';
    throw new ApiError(401, 'Session expired');
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export type InvitationDetail = Invitation & { guests: Guest[]; media: MediaAsset[] };
export type RsvpWithGuest = Rsvp & { guest: Guest | null };

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: AuthUser }>('/api/admin/me'),
  stats: () => request<AdminStats>('/api/admin/stats'),

  customers: {
    list: () => request<Customer[]>('/api/admin/customers'),
    create: (payload: Record<string, unknown>) =>
      request<Customer>('/api/admin/customers', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Record<string, unknown>) =>
      request<Customer>(`/api/admin/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/admin/customers/${id}`, { method: 'DELETE' }),
  },

  orders: {
    list: () => request<Order[]>('/api/admin/orders'),
    create: (payload: Record<string, unknown>) =>
      request<Order>('/api/admin/orders', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: number, payload: Record<string, unknown>) =>
      request<Order>(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/admin/orders/${id}`, { method: 'DELETE' }),
  },

  invitations: {
    list: () => request<Invitation[]>('/api/admin/invitations'),
    get: (id: number) => request<InvitationDetail>(`/api/admin/invitations/${id}`),
    create: (payload: Record<string, unknown>) =>
      request<Invitation>('/api/admin/invitations', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Record<string, unknown>) =>
      request<Invitation>(`/api/admin/invitations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    remove: (id: number) =>
      request<{ ok: boolean }>(`/api/admin/invitations/${id}`, { method: 'DELETE' }),
    rsvps: (id: number) =>
      request<{ items: RsvpWithGuest[]; summary: RsvpSummary }>(
        `/api/admin/invitations/${id}/rsvps`,
      ),
    wishes: (id: number) => request<Wish[]>(`/api/admin/invitations/${id}/wishes`),
  },

  wishes: {
    setStatus: (id: number, status: WishStatus) =>
      request<Wish>(`/api/admin/wishes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
};
