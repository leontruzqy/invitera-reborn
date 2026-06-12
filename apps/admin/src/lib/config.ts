/** Public web app base URL, used to link to live invitations. */
export const WEB_URL: string =
  import.meta.env.VITE_WEB_URL ?? (import.meta.env.DEV ? 'http://localhost:5173' : '');

export function publicInvitationUrl(slug: string): string | null {
  return WEB_URL ? `${WEB_URL}/${slug}` : null;
}

export function guestInvitationUrl(slug: string, guestSlug: string): string | null {
  const base = publicInvitationUrl(slug);
  return base ? `${base}?guest=${encodeURIComponent(guestSlug)}` : null;
}
