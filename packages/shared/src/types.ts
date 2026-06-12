import type {
  AttendanceStatus,
  MediaType,
  OrderStatus,
  PackageType,
  PaymentStatus,
  TemplateKey,
  UserRole,
  WishStatus,
} from './constants';

// Entity shapes as they travel over the API (dates are ISO strings).

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  customerId: number;
  packageType: PackageType;
  price: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deadline: string | null;
  createdAt: string;
  customer?: Customer;
}

export interface Invitation {
  id: number;
  customerId: number;
  orderId: number | null;
  slug: string;
  brideName: string;
  groomName: string;
  eventDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  mapsUrl: string | null;
  templateKey: TemplateKey;
  themeConfigJson: string;
  isPublished: boolean;
  createdAt: string;
  customer?: Customer;
  order?: Order | null;
}

export interface Guest {
  id: number;
  invitationId: number;
  name: string;
  phone: string | null;
  groupName: string | null;
  uniqueSlug: string;
  createdAt: string;
}

export interface Rsvp {
  id: number;
  invitationId: number;
  guestId: number | null;
  guestName: string;
  attendanceStatus: AttendanceStatus;
  paxCount: number;
  message: string | null;
  createdAt: string;
}

export interface Wish {
  id: number;
  invitationId: number;
  guestName: string;
  message: string;
  status: WishStatus;
  createdAt: string;
}

export interface MediaAsset {
  id: number;
  invitationId: number;
  type: MediaType;
  url: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

/** Invitation as served by GET /api/invitations/:slug */
export interface PublicInvitation extends Invitation {
  media: MediaAsset[];
  /** Approved wishes only. */
  wishes: Wish[];
  /** Present when the page is opened with ?guest=<unique_slug>. */
  guest?: Guest | null;
}

export interface RsvpSummary {
  total: number;
  attending: number;
  notAttending: number;
  tentative: number;
  totalPax: number;
}

export interface AdminStats {
  customers: number;
  orders: number;
  invitations: number;
  publishedInvitations: number;
  totalRsvps: number;
  pendingWishes: number;
}

/** Visual options stored in invitations.theme_config_json. */
export interface ThemeConfig {
  /** Accent color, any valid CSS color. */
  accent?: string;
  /** Optional cover/hero image URL (overrides the first media asset). */
  coverImageUrl?: string;
}

// Request payloads

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RsvpPayload {
  guestName: string;
  attendanceStatus: AttendanceStatus;
  paxCount?: number;
  message?: string;
  /** Optional guests.unique_slug to link the RSVP to a known guest. */
  guestSlug?: string;
}

export interface WishPayload {
  guestName: string;
  message: string;
}
