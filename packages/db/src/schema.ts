import { relations } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
  ATTENDANCE_STATUSES,
  MEDIA_TYPES,
  ORDER_STATUSES,
  PACKAGE_TYPES,
  PAYMENT_STATUSES,
  TEMPLATE_KEYS,
  USER_ROLES,
  WISH_STATUSES,
} from '@invitera/shared';

const id = () => integer('id').primaryKey({ autoIncrement: true });
const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date());

export const users = sqliteTable('users', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: USER_ROLES }).notNull().default('admin'),
  createdAt: createdAt(),
});

export const customers = sqliteTable('customers', {
  id: id(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  instagram: text('instagram'),
  notes: text('notes'),
  createdAt: createdAt(),
});

export const orders = sqliteTable('orders', {
  id: id(),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  packageType: text('package_type', { enum: PACKAGE_TYPES }).notNull().default('basic'),
  price: real('price').notNull().default(0),
  paymentStatus: text('payment_status', { enum: PAYMENT_STATUSES }).notNull().default('unpaid'),
  orderStatus: text('order_status', { enum: ORDER_STATUSES }).notNull().default('pending'),
  deadline: integer('deadline', { mode: 'timestamp_ms' }),
  createdAt: createdAt(),
});

export const invitations = sqliteTable('invitations', {
  id: id(),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  slug: text('slug').notNull().unique(),
  brideName: text('bride_name').notNull(),
  groomName: text('groom_name').notNull(),
  eventDate: integer('event_date', { mode: 'timestamp_ms' }),
  venueName: text('venue_name'),
  venueAddress: text('venue_address'),
  mapsUrl: text('maps_url'),
  templateKey: text('template_key', { enum: TEMPLATE_KEYS }).notNull().default('modern-minimal'),
  themeConfigJson: text('theme_config_json').notNull().default('{}'),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  createdAt: createdAt(),
});

export const guests = sqliteTable('guests', {
  id: id(),
  invitationId: integer('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone'),
  groupName: text('group_name'),
  uniqueSlug: text('unique_slug').notNull().unique(),
  createdAt: createdAt(),
});

export const rsvps = sqliteTable('rsvps', {
  id: id(),
  invitationId: integer('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  guestId: integer('guest_id').references(() => guests.id, { onDelete: 'set null' }),
  guestName: text('guest_name').notNull(),
  attendanceStatus: text('attendance_status', { enum: ATTENDANCE_STATUSES }).notNull(),
  paxCount: integer('pax_count').notNull().default(1),
  message: text('message'),
  createdAt: createdAt(),
});

export const wishes = sqliteTable('wishes', {
  id: id(),
  invitationId: integer('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: WISH_STATUSES }).notNull().default('pending'),
  createdAt: createdAt(),
});

export const mediaAssets = sqliteTable('media_assets', {
  id: id(),
  invitationId: integer('invitation_id')
    .notNull()
    .references(() => invitations.id, { onDelete: 'cascade' }),
  type: text('type', { enum: MEDIA_TYPES }).notNull().default('image'),
  url: text('url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
});

// Relations (for db.query relational API)

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  invitations: many(invitations),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
  customer: one(customers, { fields: [invitations.customerId], references: [customers.id] }),
  order: one(orders, { fields: [invitations.orderId], references: [orders.id] }),
  guests: many(guests),
  rsvps: many(rsvps),
  wishes: many(wishes),
  media: many(mediaAssets),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  invitation: one(invitations, { fields: [guests.invitationId], references: [invitations.id] }),
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  invitation: one(invitations, { fields: [rsvps.invitationId], references: [invitations.id] }),
  guest: one(guests, { fields: [rsvps.guestId], references: [guests.id] }),
}));

export const wishesRelations = relations(wishes, ({ one }) => ({
  invitation: one(invitations, { fields: [wishes.invitationId], references: [invitations.id] }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  invitation: one(invitations, { fields: [mediaAssets.invitationId], references: [invitations.id] }),
}));

// Row types

export type UserRow = typeof users.$inferSelect;
export type CustomerRow = typeof customers.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type InvitationRow = typeof invitations.$inferSelect;
export type GuestRow = typeof guests.$inferSelect;
export type RsvpRow = typeof rsvps.$inferSelect;
export type WishRow = typeof wishes.$inferSelect;
export type MediaAssetRow = typeof mediaAssets.$inferSelect;
