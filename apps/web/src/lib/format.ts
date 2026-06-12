export function formatEventDate(iso: string | null | undefined, withTime = false): string {
  if (!iso) return 'Segera diumumkan';
  const date = new Date(iso);
  const formatted = date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  if (!withTime) return formatted;
  const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  return `${formatted} · ${time}`;
}
