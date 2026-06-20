import { and, asc, desc, eq } from 'drizzle-orm';
import {
  customers,
  db,
  giftAccounts,
  guests,
  invitationEvents,
  invitations,
  loveStoryEvents,
  mediaAssets,
  orders,
  rsvps,
  users,
  wishes,
} from '@invitera/db';
import {
  GIFT_ACCOUNT_TYPES,
  isValidJsonObject,
  isValidSlug,
  MEDIA_SLOTS,
  MEDIA_TYPES,
  ORDER_STATUSES,
  PACKAGE_TYPES,
  PAYMENT_STATUSES,
  TEMPLATE_KEYS,
  WISH_STATUSES,
} from '@invitera/shared';
import { Elysia, t } from 'elysia';
import { bearerToken, jwtPlugin, TOKEN_TTL_SECONDS, type TokenPayload } from '../auth';
import { HttpError } from '../errors';

// ── schemas ───────────────────────────────────────────────────────────

const idParams = t.Object({ id: t.Numeric({ minimum: 1 }) });

/** Nested child resource under an invitation (events, story, gifts, media). */
const childParams = t.Object({
  id: t.Numeric({ minimum: 1 }),
  childId: t.Numeric({ minimum: 1 }),
});

const optionalText = (maxLength: number) =>
  t.Optional(t.Union([t.String({ maxLength }), t.Null()]));

/** ISO date string or null (to clear the field). */
const optionalDate = t.Optional(t.Union([t.String({ maxLength: 40 }), t.Null()]));

const packageTypeEnum = t.Union(PACKAGE_TYPES.map((v) => t.Literal(v)));
const paymentStatusEnum = t.Union(PAYMENT_STATUSES.map((v) => t.Literal(v)));
const orderStatusEnum = t.Union(ORDER_STATUSES.map((v) => t.Literal(v)));
const templateKeyEnum = t.Union(TEMPLATE_KEYS.map((v) => t.Literal(v)));
const wishStatusEnum = t.Union(WISH_STATUSES.map((v) => t.Literal(v)));
const mediaTypeEnum = t.Union(MEDIA_TYPES.map((v) => t.Literal(v)));
const mediaSlotEnum = t.Union(MEDIA_SLOTS.map((v) => t.Literal(v)));
const giftTypeEnum = t.Union(GIFT_ACCOUNT_TYPES.map((v) => t.Literal(v)));
const sortOrderField = t.Optional(t.Integer({ minimum: 0, maximum: 9999 }));

const customerBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  phone: optionalText(40),
  email: optionalText(120),
  instagram: optionalText(80),
  notes: optionalText(2000),
});

const orderBody = t.Object({
  customerId: t.Integer({ minimum: 1 }),
  packageType: packageTypeEnum,
  price: t.Number({ minimum: 0 }),
  paymentStatus: t.Optional(paymentStatusEnum),
  orderStatus: t.Optional(orderStatusEnum),
  deadline: optionalDate,
});

const invitationBody = t.Object({
  customerId: t.Integer({ minimum: 1 }),
  orderId: t.Optional(t.Union([t.Integer({ minimum: 1 }), t.Null()])),
  slug: t.String({ minLength: 3, maxLength: 64 }),
  brideName: t.String({ minLength: 1, maxLength: 120 }),
  groomName: t.String({ minLength: 1, maxLength: 120 }),
  brideShortName: optionalText(120),
  groomShortName: optionalText(120),
  brideParents: optionalText(300),
  groomParents: optionalText(300),
  brideTagline: optionalText(120),
  groomTagline: optionalText(120),
  eventDate: optionalDate,
  venueName: optionalText(200),
  venueAddress: optionalText(500),
  mapsUrl: optionalText(500),
  openingGreeting: optionalText(300),
  verseArabic: optionalText(2000),
  verseTranslation: optionalText(2000),
  verseReference: optionalText(200),
  closingMessage: optionalText(1000),
  hashtag: optionalText(80),
  rsvpDeadline: optionalDate,
  templateKey: t.Optional(templateKeyEnum),
  themeConfigJson: t.Optional(t.String({ maxLength: 10_000 })),
  isPublished: t.Optional(t.Boolean()),
});

/** Plain pass-through text columns shared by invitation POST/PATCH. */
const INVITATION_TEXT_FIELDS = [
  'brideShortName',
  'groomShortName',
  'brideParents',
  'groomParents',
  'brideTagline',
  'groomTagline',
  'venueName',
  'venueAddress',
  'mapsUrl',
  'openingGreeting',
  'verseArabic',
  'verseTranslation',
  'verseReference',
  'closingMessage',
  'hashtag',
] as const;

const eventBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 120 }),
  eventDate: optionalDate,
  timeLabel: optionalText(80),
  venueName: optionalText(200),
  venueAddress: optionalText(500),
  mapsUrl: optionalText(500),
  sortOrder: sortOrderField,
});

const storyBody = t.Object({
  title: t.String({ minLength: 1, maxLength: 120 }),
  whenLabel: optionalText(60),
  description: t.String({ minLength: 1, maxLength: 2000 }),
  sortOrder: sortOrderField,
});

const giftBody = t.Object({
  type: t.Optional(giftTypeEnum),
  bankName: optionalText(120),
  accountNumber: optionalText(80),
  accountName: optionalText(120),
  address: optionalText(500),
  sortOrder: sortOrderField,
});

const mediaBody = t.Object({
  type: t.Optional(mediaTypeEnum),
  slot: t.Optional(mediaSlotEnum),
  url: t.String({ minLength: 1, maxLength: 1000 }),
  altText: optionalText(200),
  sortOrder: sortOrderField,
});

// ── helpers ───────────────────────────────────────────────────────────

function ensureUpdate(body: Record<string, unknown>) {
  if (Object.keys(body).length === 0) throw new HttpError(400, 'No fields to update');
}

/** undefined = field absent, null/'' = clear, string = parse or 400. */
function parseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new HttpError(400, `Invalid date: ${value}`);
  return date;
}

async function ensureCustomerExists(id: number) {
  const row = await db.query.customers.findFirst({
    where: eq(customers.id, id),
    columns: { id: true },
  });
  if (!row) throw new HttpError(400, `Customer #${id} does not exist`);
}

async function ensureOrderExists(id: number) {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { id: true },
  });
  if (!row) throw new HttpError(400, `Order #${id} does not exist`);
}

async function ensureInvitationExists(id: number) {
  const row = await db.query.invitations.findFirst({
    where: eq(invitations.id, id),
    columns: { id: true },
  });
  if (!row) throw new HttpError(404, 'Invitation not found');
}

async function ensureSlugAvailable(slug: string, excludeId?: number) {
  const existing = await db.query.invitations.findFirst({
    where: eq(invitations.slug, slug),
    columns: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    throw new HttpError(409, `Slug "${slug}" is already taken`);
  }
}

function normalizeSlug(raw: string): string {
  const slug = raw.trim().toLowerCase();
  if (!isValidSlug(slug)) {
    throw new HttpError(400, 'Slug must be kebab-case (a-z, 0-9, dashes), 3-64 chars');
  }
  return slug;
}

function validateThemeConfig(json: string) {
  if (!isValidJsonObject(json)) {
    throw new HttpError(400, 'themeConfigJson must be a valid JSON object');
  }
}

/** Children first — SQLite foreign_keys pragma may be off, so cascade in code. */
async function deleteInvitationCascade(invitationId: number) {
  await db.delete(rsvps).where(eq(rsvps.invitationId, invitationId));
  await db.delete(wishes).where(eq(wishes.invitationId, invitationId));
  await db.delete(mediaAssets).where(eq(mediaAssets.invitationId, invitationId));
  await db.delete(invitationEvents).where(eq(invitationEvents.invitationId, invitationId));
  await db.delete(loveStoryEvents).where(eq(loveStoryEvents.invitationId, invitationId));
  await db.delete(giftAccounts).where(eq(giftAccounts.invitationId, invitationId));
  await db.delete(guests).where(eq(guests.invitationId, invitationId));
  await db.delete(invitations).where(eq(invitations.id, invitationId));
}

function publicUser(user: typeof users.$inferSelect) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ── routes ────────────────────────────────────────────────────────────

export const adminRoutes = new Elysia({ prefix: '/api/admin' })
  .use(jwtPlugin)

  // Public: login (registered before the auth guard below).
  .post(
    '/login',
    async ({ body, jwt, set }) => {
      const email = body.email.trim().toLowerCase();
      const user = await db.query.users.findFirst({ where: eq(users.email, email) });
      const valid = user && (await Bun.password.verify(body.password, user.passwordHash));
      if (!user || !valid) {
        set.status = 401;
        return { error: 'Invalid email or password' };
      }
      const payload: TokenPayload = {
        sub: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
      };
      const token = await jwt.sign({ ...payload });
      return { token, user: publicUser(user) };
    },
    {
      body: t.Object({
        email: t.String({ minLength: 3, maxLength: 255 }),
        password: t.String({ minLength: 1, maxLength: 255 }),
      }),
    },
  )

  // Everything below requires a valid Bearer token.
  .derive(async ({ jwt, headers }) => {
    const token = bearerToken(headers.authorization);
    const payload = token ? await jwt.verify(token) : false;
    return { auth: payload ? (payload as unknown as TokenPayload) : null };
  })
  .onBeforeHandle(({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  })

  .get('/me', async ({ auth, set }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, Number(auth!.sub)),
    });
    if (!user) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
    return { user: publicUser(user) };
  })

  .get('/stats', async () => ({
    customers: await db.$count(customers),
    orders: await db.$count(orders),
    invitations: await db.$count(invitations),
    publishedInvitations: await db.$count(invitations, eq(invitations.isPublished, true)),
    totalRsvps: await db.$count(rsvps),
    pendingWishes: await db.$count(wishes, eq(wishes.status, 'pending')),
  }))

  // ── customers ──
  .get('/customers', () =>
    db.query.customers.findMany({ orderBy: [desc(customers.createdAt)] }),
  )
  .post(
    '/customers',
    async ({ body, set }) => {
      const [created] = await db
        .insert(customers)
        .values({ ...body, name: body.name.trim() })
        .returning();
      set.status = 201;
      return created;
    },
    { body: customerBody },
  )
  .get(
    '/customers/:id',
    async ({ params }) => {
      const row = await db.query.customers.findFirst({
        where: eq(customers.id, params.id),
        with: {
          orders: { orderBy: [desc(orders.createdAt)] },
          invitations: { orderBy: [desc(invitations.createdAt)] },
        },
      });
      if (!row) throw new HttpError(404, 'Customer not found');
      return row;
    },
    { params: idParams },
  )
  .patch(
    '/customers/:id',
    async ({ params, body }) => {
      ensureUpdate(body);
      const [updated] = await db
        .update(customers)
        .set(body)
        .where(eq(customers.id, params.id))
        .returning();
      if (!updated) throw new HttpError(404, 'Customer not found');
      return updated;
    },
    { params: idParams, body: t.Partial(customerBody) },
  )
  .delete(
    '/customers/:id',
    async ({ params }) => {
      const existing = await db.query.customers.findFirst({
        where: eq(customers.id, params.id),
        columns: { id: true },
      });
      if (!existing) throw new HttpError(404, 'Customer not found');
      const invs = await db
        .select({ id: invitations.id })
        .from(invitations)
        .where(eq(invitations.customerId, params.id));
      for (const inv of invs) await deleteInvitationCascade(inv.id);
      await db.delete(orders).where(eq(orders.customerId, params.id));
      await db.delete(customers).where(eq(customers.id, params.id));
      return { ok: true };
    },
    { params: idParams },
  )

  // ── orders ──
  .get('/orders', () =>
    db.query.orders.findMany({
      with: { customer: true },
      orderBy: [desc(orders.createdAt)],
    }),
  )
  .post(
    '/orders',
    async ({ body, set }) => {
      await ensureCustomerExists(body.customerId);
      const [created] = await db
        .insert(orders)
        .values({
          customerId: body.customerId,
          packageType: body.packageType,
          price: body.price,
          paymentStatus: body.paymentStatus ?? 'unpaid',
          orderStatus: body.orderStatus ?? 'pending',
          deadline: parseDate(body.deadline) ?? null,
        })
        .returning();
      set.status = 201;
      return created;
    },
    { body: orderBody },
  )
  .get(
    '/orders/:id',
    async ({ params }) => {
      const row = await db.query.orders.findFirst({
        where: eq(orders.id, params.id),
        with: { customer: true, invitations: true },
      });
      if (!row) throw new HttpError(404, 'Order not found');
      return row;
    },
    { params: idParams },
  )
  .patch(
    '/orders/:id',
    async ({ params, body }) => {
      ensureUpdate(body);
      if (body.customerId !== undefined) await ensureCustomerExists(body.customerId);
      const updates: Partial<typeof orders.$inferInsert> = {};
      if (body.customerId !== undefined) updates.customerId = body.customerId;
      if (body.packageType !== undefined) updates.packageType = body.packageType;
      if (body.price !== undefined) updates.price = body.price;
      if (body.paymentStatus !== undefined) updates.paymentStatus = body.paymentStatus;
      if (body.orderStatus !== undefined) updates.orderStatus = body.orderStatus;
      if (body.deadline !== undefined) updates.deadline = parseDate(body.deadline);
      const [updated] = await db
        .update(orders)
        .set(updates)
        .where(eq(orders.id, params.id))
        .returning();
      if (!updated) throw new HttpError(404, 'Order not found');
      return updated;
    },
    { params: idParams, body: t.Partial(orderBody) },
  )
  .delete(
    '/orders/:id',
    async ({ params }) => {
      // Detach invitations that reference this order, then delete it.
      await db
        .update(invitations)
        .set({ orderId: null })
        .where(eq(invitations.orderId, params.id));
      const deleted = await db.delete(orders).where(eq(orders.id, params.id)).returning();
      if (deleted.length === 0) throw new HttpError(404, 'Order not found');
      return { ok: true };
    },
    { params: idParams },
  )

  // ── invitations ──
  .get('/invitations', () =>
    db.query.invitations.findMany({
      with: { customer: true },
      orderBy: [desc(invitations.createdAt)],
    }),
  )
  .post(
    '/invitations',
    async ({ body, set }) => {
      const slug = normalizeSlug(body.slug);
      await ensureCustomerExists(body.customerId);
      if (body.orderId != null) await ensureOrderExists(body.orderId);
      await ensureSlugAvailable(slug);
      if (body.themeConfigJson !== undefined) validateThemeConfig(body.themeConfigJson);
      const textValues: Record<string, string | null> = {};
      for (const field of INVITATION_TEXT_FIELDS) textValues[field] = body[field] ?? null;
      const [created] = await db
        .insert(invitations)
        .values({
          customerId: body.customerId,
          orderId: body.orderId ?? null,
          slug,
          brideName: body.brideName.trim(),
          groomName: body.groomName.trim(),
          ...textValues,
          eventDate: parseDate(body.eventDate) ?? null,
          rsvpDeadline: parseDate(body.rsvpDeadline) ?? null,
          templateKey: body.templateKey ?? 'rani-raka',
          themeConfigJson: body.themeConfigJson ?? '{}',
          isPublished: body.isPublished ?? false,
        })
        .returning();
      set.status = 201;
      return created;
    },
    { body: invitationBody },
  )
  .get(
    '/invitations/:id',
    async ({ params }) => {
      const row = await db.query.invitations.findFirst({
        where: eq(invitations.id, params.id),
        with: {
          customer: true,
          order: true,
          media: { orderBy: [asc(mediaAssets.sortOrder)] },
          events: { orderBy: [asc(invitationEvents.sortOrder)] },
          story: { orderBy: [asc(loveStoryEvents.sortOrder)] },
          gifts: { orderBy: [asc(giftAccounts.sortOrder)] },
          guests: { orderBy: [desc(guests.createdAt)] },
        },
      });
      if (!row) throw new HttpError(404, 'Invitation not found');
      return row;
    },
    { params: idParams },
  )
  .patch(
    '/invitations/:id',
    async ({ params, body }) => {
      ensureUpdate(body);
      const updates: Partial<typeof invitations.$inferInsert> = {};
      if (body.slug !== undefined) {
        const slug = normalizeSlug(body.slug);
        await ensureSlugAvailable(slug, params.id);
        updates.slug = slug;
      }
      if (body.customerId !== undefined) {
        await ensureCustomerExists(body.customerId);
        updates.customerId = body.customerId;
      }
      if (body.orderId !== undefined) {
        if (body.orderId !== null) await ensureOrderExists(body.orderId);
        updates.orderId = body.orderId;
      }
      if (body.brideName !== undefined) updates.brideName = body.brideName.trim();
      if (body.groomName !== undefined) updates.groomName = body.groomName.trim();
      for (const field of INVITATION_TEXT_FIELDS) {
        if (body[field] !== undefined) updates[field] = body[field];
      }
      if (body.eventDate !== undefined) updates.eventDate = parseDate(body.eventDate);
      if (body.rsvpDeadline !== undefined) updates.rsvpDeadline = parseDate(body.rsvpDeadline);
      if (body.templateKey !== undefined) updates.templateKey = body.templateKey;
      if (body.themeConfigJson !== undefined) {
        validateThemeConfig(body.themeConfigJson);
        updates.themeConfigJson = body.themeConfigJson;
      }
      if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
      const [updated] = await db
        .update(invitations)
        .set(updates)
        .where(eq(invitations.id, params.id))
        .returning();
      if (!updated) throw new HttpError(404, 'Invitation not found');
      return updated;
    },
    { params: idParams, body: t.Partial(invitationBody) },
  )
  .delete(
    '/invitations/:id',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      await deleteInvitationCascade(params.id);
      return { ok: true };
    },
    { params: idParams },
  )
  .get(
    '/invitations/:id/rsvps',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      const items = await db.query.rsvps.findMany({
        where: eq(rsvps.invitationId, params.id),
        with: { guest: true },
        orderBy: [desc(rsvps.createdAt)],
      });
      const attending = items.filter((r) => r.attendanceStatus === 'attending');
      const summary = {
        total: items.length,
        attending: attending.length,
        notAttending: items.filter((r) => r.attendanceStatus === 'not_attending').length,
        tentative: items.filter((r) => r.attendanceStatus === 'tentative').length,
        totalPax: attending.reduce((sum, r) => sum + r.paxCount, 0),
      };
      return { items, summary };
    },
    { params: idParams },
  )
  .get(
    '/invitations/:id/wishes',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      return db.query.wishes.findMany({
        where: eq(wishes.invitationId, params.id),
        orderBy: [desc(wishes.createdAt)],
      });
    },
    { params: idParams },
  )

  // ── schedule events (Akad / Resepsi) ──
  .get(
    '/invitations/:id/events',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      return db.query.invitationEvents.findMany({
        where: eq(invitationEvents.invitationId, params.id),
        orderBy: [asc(invitationEvents.sortOrder)],
      });
    },
    { params: idParams },
  )
  .post(
    '/invitations/:id/events',
    async ({ params, body, set }) => {
      await ensureInvitationExists(params.id);
      const [created] = await db
        .insert(invitationEvents)
        .values({
          invitationId: params.id,
          name: body.name.trim(),
          eventDate: parseDate(body.eventDate) ?? null,
          timeLabel: body.timeLabel ?? null,
          venueName: body.venueName ?? null,
          venueAddress: body.venueAddress ?? null,
          mapsUrl: body.mapsUrl ?? null,
          sortOrder: body.sortOrder ?? 0,
        })
        .returning();
      set.status = 201;
      return created;
    },
    { params: idParams, body: eventBody },
  )
  .patch(
    '/invitations/:id/events/:childId',
    async ({ params, body }) => {
      ensureUpdate(body);
      const updates: Partial<typeof invitationEvents.$inferInsert> = {};
      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.eventDate !== undefined) updates.eventDate = parseDate(body.eventDate);
      if (body.timeLabel !== undefined) updates.timeLabel = body.timeLabel;
      if (body.venueName !== undefined) updates.venueName = body.venueName;
      if (body.venueAddress !== undefined) updates.venueAddress = body.venueAddress;
      if (body.mapsUrl !== undefined) updates.mapsUrl = body.mapsUrl;
      if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
      const [updated] = await db
        .update(invitationEvents)
        .set(updates)
        .where(
          and(
            eq(invitationEvents.id, params.childId),
            eq(invitationEvents.invitationId, params.id),
          ),
        )
        .returning();
      if (!updated) throw new HttpError(404, 'Event not found');
      return updated;
    },
    { params: childParams, body: t.Partial(eventBody) },
  )
  .delete(
    '/invitations/:id/events/:childId',
    async ({ params }) => {
      const deleted = await db
        .delete(invitationEvents)
        .where(
          and(
            eq(invitationEvents.id, params.childId),
            eq(invitationEvents.invitationId, params.id),
          ),
        )
        .returning();
      if (deleted.length === 0) throw new HttpError(404, 'Event not found');
      return { ok: true };
    },
    { params: childParams },
  )

  // ── love story milestones ──
  .get(
    '/invitations/:id/story',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      return db.query.loveStoryEvents.findMany({
        where: eq(loveStoryEvents.invitationId, params.id),
        orderBy: [asc(loveStoryEvents.sortOrder)],
      });
    },
    { params: idParams },
  )
  .post(
    '/invitations/:id/story',
    async ({ params, body, set }) => {
      await ensureInvitationExists(params.id);
      const [created] = await db
        .insert(loveStoryEvents)
        .values({
          invitationId: params.id,
          title: body.title.trim(),
          whenLabel: body.whenLabel ?? null,
          description: body.description.trim(),
          sortOrder: body.sortOrder ?? 0,
        })
        .returning();
      set.status = 201;
      return created;
    },
    { params: idParams, body: storyBody },
  )
  .patch(
    '/invitations/:id/story/:childId',
    async ({ params, body }) => {
      ensureUpdate(body);
      const updates: Partial<typeof loveStoryEvents.$inferInsert> = {};
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.whenLabel !== undefined) updates.whenLabel = body.whenLabel;
      if (body.description !== undefined) updates.description = body.description.trim();
      if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
      const [updated] = await db
        .update(loveStoryEvents)
        .set(updates)
        .where(
          and(
            eq(loveStoryEvents.id, params.childId),
            eq(loveStoryEvents.invitationId, params.id),
          ),
        )
        .returning();
      if (!updated) throw new HttpError(404, 'Story milestone not found');
      return updated;
    },
    { params: childParams, body: t.Partial(storyBody) },
  )
  .delete(
    '/invitations/:id/story/:childId',
    async ({ params }) => {
      const deleted = await db
        .delete(loveStoryEvents)
        .where(
          and(
            eq(loveStoryEvents.id, params.childId),
            eq(loveStoryEvents.invitationId, params.id),
          ),
        )
        .returning();
      if (deleted.length === 0) throw new HttpError(404, 'Story milestone not found');
      return { ok: true };
    },
    { params: childParams },
  )

  // ── wedding gift accounts ──
  .get(
    '/invitations/:id/gifts',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      return db.query.giftAccounts.findMany({
        where: eq(giftAccounts.invitationId, params.id),
        orderBy: [asc(giftAccounts.sortOrder)],
      });
    },
    { params: idParams },
  )
  .post(
    '/invitations/:id/gifts',
    async ({ params, body, set }) => {
      await ensureInvitationExists(params.id);
      const [created] = await db
        .insert(giftAccounts)
        .values({
          invitationId: params.id,
          type: body.type ?? 'bank',
          bankName: body.bankName ?? null,
          accountNumber: body.accountNumber ?? null,
          accountName: body.accountName ?? null,
          address: body.address ?? null,
          sortOrder: body.sortOrder ?? 0,
        })
        .returning();
      set.status = 201;
      return created;
    },
    { params: idParams, body: giftBody },
  )
  .patch(
    '/invitations/:id/gifts/:childId',
    async ({ params, body }) => {
      ensureUpdate(body);
      const updates: Partial<typeof giftAccounts.$inferInsert> = {};
      if (body.type !== undefined) updates.type = body.type;
      if (body.bankName !== undefined) updates.bankName = body.bankName;
      if (body.accountNumber !== undefined) updates.accountNumber = body.accountNumber;
      if (body.accountName !== undefined) updates.accountName = body.accountName;
      if (body.address !== undefined) updates.address = body.address;
      if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
      const [updated] = await db
        .update(giftAccounts)
        .set(updates)
        .where(
          and(eq(giftAccounts.id, params.childId), eq(giftAccounts.invitationId, params.id)),
        )
        .returning();
      if (!updated) throw new HttpError(404, 'Gift account not found');
      return updated;
    },
    { params: childParams, body: t.Partial(giftBody) },
  )
  .delete(
    '/invitations/:id/gifts/:childId',
    async ({ params }) => {
      const deleted = await db
        .delete(giftAccounts)
        .where(
          and(eq(giftAccounts.id, params.childId), eq(giftAccounts.invitationId, params.id)),
        )
        .returning();
      if (deleted.length === 0) throw new HttpError(404, 'Gift account not found');
      return { ok: true };
    },
    { params: childParams },
  )

  // ── media assets ──
  .get(
    '/invitations/:id/media',
    async ({ params }) => {
      await ensureInvitationExists(params.id);
      return db.query.mediaAssets.findMany({
        where: eq(mediaAssets.invitationId, params.id),
        orderBy: [asc(mediaAssets.sortOrder)],
      });
    },
    { params: idParams },
  )
  .post(
    '/invitations/:id/media',
    async ({ params, body, set }) => {
      await ensureInvitationExists(params.id);
      const [created] = await db
        .insert(mediaAssets)
        .values({
          invitationId: params.id,
          type: body.type ?? 'image',
          slot: body.slot ?? 'gallery',
          url: body.url.trim(),
          altText: body.altText ?? null,
          sortOrder: body.sortOrder ?? 0,
        })
        .returning();
      set.status = 201;
      return created;
    },
    { params: idParams, body: mediaBody },
  )
  .patch(
    '/invitations/:id/media/:childId',
    async ({ params, body }) => {
      ensureUpdate(body);
      const updates: Partial<typeof mediaAssets.$inferInsert> = {};
      if (body.type !== undefined) updates.type = body.type;
      if (body.slot !== undefined) updates.slot = body.slot;
      if (body.url !== undefined) updates.url = body.url.trim();
      if (body.altText !== undefined) updates.altText = body.altText;
      if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
      const [updated] = await db
        .update(mediaAssets)
        .set(updates)
        .where(
          and(eq(mediaAssets.id, params.childId), eq(mediaAssets.invitationId, params.id)),
        )
        .returning();
      if (!updated) throw new HttpError(404, 'Media asset not found');
      return updated;
    },
    { params: childParams, body: t.Partial(mediaBody) },
  )
  .delete(
    '/invitations/:id/media/:childId',
    async ({ params }) => {
      const deleted = await db
        .delete(mediaAssets)
        .where(
          and(eq(mediaAssets.id, params.childId), eq(mediaAssets.invitationId, params.id)),
        )
        .returning();
      if (deleted.length === 0) throw new HttpError(404, 'Media asset not found');
      return { ok: true };
    },
    { params: childParams },
  )

  // ── wishes moderation ──
  .patch(
    '/wishes/:id/status',
    async ({ params, body }) => {
      const [updated] = await db
        .update(wishes)
        .set({ status: body.status })
        .where(eq(wishes.id, params.id))
        .returning();
      if (!updated) throw new HttpError(404, 'Wish not found');
      return updated;
    },
    { params: idParams, body: t.Object({ status: wishStatusEnum }) },
  );
