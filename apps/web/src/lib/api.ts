import type { PublicInvitation, Rsvp, RsvpPayload, Wish, WishPayload } from '@invitera/shared';

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
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export function fetchInvitation(slug: string, guestSlug?: string): Promise<PublicInvitation> {
  const query = guestSlug ? `?guest=${encodeURIComponent(guestSlug)}` : '';
  return request<PublicInvitation>(`/api/invitations/${encodeURIComponent(slug)}${query}`);
}

export function submitRsvp(slug: string, payload: RsvpPayload): Promise<Rsvp> {
  return request<Rsvp>(`/api/invitations/${encodeURIComponent(slug)}/rsvp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function submitWish(slug: string, payload: WishPayload): Promise<Wish> {
  return request<Wish>(`/api/invitations/${encodeURIComponent(slug)}/wishes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
