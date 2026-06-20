export const TEMPLATE_KEYS = ['rani-raka'] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  'rani-raka': 'Rani & Raka (Peacock)',
};

export const DEFAULT_TEMPLATE_KEY: TemplateKey = 'rani-raka';

export const PACKAGE_TYPES = ['basic', 'premium', 'exclusive'] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_STATUSES = ['pending', 'in_progress', 'review', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['attending', 'not_attending', 'tentative'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const WISH_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type WishStatus = (typeof WISH_STATUSES)[number];

export const USER_ROLES = ['admin', 'staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const MEDIA_TYPES = ['image', 'video', 'audio'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

/** Where a media asset is shown in the template. */
export const MEDIA_SLOTS = ['cover', 'hero', 'bride', 'groom', 'gallery'] as const;
export type MediaSlot = (typeof MEDIA_SLOTS)[number];

/** A wedding-gift entry: a bank account or a physical gift address. */
export const GIFT_ACCOUNT_TYPES = ['bank', 'address'] as const;
export type GiftAccountType = (typeof GIFT_ACCOUNT_TYPES)[number];

/** Hero presentation style for the Rani & Raka template. */
export const HERO_STYLES = ['gate', 'peacock'] as const;
export type HeroStyle = (typeof HERO_STYLES)[number];

/**
 * Palette presets — each is `[night, peacock, teal, gold]`. The first entry
 * doubles as the preset key. Mirrors the design's tweak panel options.
 */
export const PALETTE_PRESETS: readonly (readonly [string, string, string, string])[] = [
  ['#0d2b4e', '#1f6fa8', '#2fa39a', '#cda434'], // Peacock Navy
  ['#4a1230', '#8c2b50', '#1f7a64', '#d4af37'], // Maroon
  ['#123a2e', '#1f7a5c', '#2fa37a', '#cda434'], // Emerald
] as const;

export const DEFAULT_PALETTE = PALETTE_PRESETS[0];
