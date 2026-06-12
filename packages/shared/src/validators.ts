import type { ThemeConfig } from './types';

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Lowercase kebab-case, 3-64 chars, e.g. "aisyah-raka". */
export function isValidSlug(value: string): boolean {
  return value.length >= 3 && value.length <= 64 && SLUG_REGEX.test(value);
}

/** Best-effort slug from free text: "Aisyah & Raka!" -> "aisyah-raka". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** True when the string parses to a plain JSON object. */
export function isValidJsonObject(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

/** Safe parse of theme_config_json; never throws, falls back to {}. */
export function parseThemeConfig(json: string | null | undefined): ThemeConfig {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as ThemeConfig;
    }
    return {};
  } catch {
    return {};
  }
}
