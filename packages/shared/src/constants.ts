export const TEMPLATE_KEYS = [
  'modern-minimal',
  'floral-elegant',
  'javanese-classic',
  'islamic-clean',
  'luxury-dark',
] as const;
export type TemplateKey = (typeof TEMPLATE_KEYS)[number];

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  'modern-minimal': 'Modern Minimal',
  'floral-elegant': 'Floral Elegant',
  'javanese-classic': 'Javanese Classic',
  'islamic-clean': 'Islamic Clean',
  'luxury-dark': 'Luxury Dark',
};

export const DEFAULT_TEMPLATE_KEY: TemplateKey = 'modern-minimal';

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
