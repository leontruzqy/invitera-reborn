import type {
  AttendanceStatus,
  GiftAccountType,
  HeroStyle,
  MediaSlot,
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
  /** Full names, e.g. "Rani Maharani". */
  brideName: string;
  groomName: string;
  /** Short hero/cover display names, e.g. "Rani". Falls back to brideName. */
  brideShortName: string | null;
  groomShortName: string | null;
  /** Parents line, e.g. "Bapak H. Bambang Wijaya & Ibu Hj. Dewi Lestari". */
  brideParents: string | null;
  groomParents: string | null;
  /** Small role label under the name, e.g. "Putri dari Pasangan". */
  brideTagline: string | null;
  groomTagline: string | null;
  /** Primary event date — drives the countdown and hero date. */
  eventDate: string | null;
  /** Main venue (hero/location summary). */
  venueName: string | null;
  venueAddress: string | null;
  mapsUrl: string | null;
  /** Opening section copy. */
  openingGreeting: string | null;
  verseArabic: string | null;
  verseTranslation: string | null;
  verseReference: string | null;
  /** Footer closing paragraph. */
  closingMessage: string | null;
  hashtag: string | null;
  /** RSVP confirm-by date. */
  rsvpDeadline: string | null;
  templateKey: TemplateKey;
  themeConfigJson: string;
  isPublished: boolean;
  createdAt: string;
  customer?: Customer;
  order?: Order | null;
}

/** A ceremony in the schedule, e.g. Akad Nikah or Resepsi. */
export interface InvitationEvent {
  id: number;
  invitationId: number;
  name: string;
  eventDate: string | null;
  /** Free-text time label, e.g. "09.00 – 10.00 WIB". */
  timeLabel: string | null;
  venueName: string | null;
  venueAddress: string | null;
  mapsUrl: string | null;
  sortOrder: number;
  createdAt: string;
}

/** A love-story milestone. */
export interface LoveStoryEvent {
  id: number;
  invitationId: number;
  title: string;
  /** Free-text time label, e.g. "2021". */
  whenLabel: string | null;
  description: string;
  sortOrder: number;
  createdAt: string;
}

/** A wedding-gift bank account or gift address. */
export interface GiftAccount {
  id: number;
  invitationId: number;
  type: GiftAccountType;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  address: string | null;
  sortOrder: number;
  createdAt: string;
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
  slot: MediaSlot;
  url: string;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
}

/** Invitation as served by GET /api/invitations/:slug */
export interface PublicInvitation extends Invitation {
  media: MediaAsset[];
  events: InvitationEvent[];
  story: LoveStoryEvent[];
  gifts: GiftAccount[];
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
  /** Palette preset `[night, peacock, teal, gold]`. */
  palette?: string[];
  /** Hero presentation style. */
  heroStyle?: HeroStyle;
  /** Master toggle for animations / parallax. */
  motion?: boolean;
  /** Number of parallax birds in the background flock. */
  birds?: number;
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
