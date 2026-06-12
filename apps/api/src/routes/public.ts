import { and, asc, desc, eq } from 'drizzle-orm';
import { db, guests, invitations, mediaAssets, rsvps, wishes } from '@invitera/db';
import { Elysia, t } from 'elysia';

const slugParams = t.Object({ slug: t.String({ minLength: 1, maxLength: 64 }) });

async function findPublishedInvitation(slug: string) {
  return db.query.invitations.findFirst({
    where: and(eq(invitations.slug, slug), eq(invitations.isPublished, true)),
  });
}

export const publicRoutes = new Elysia({ prefix: '/api/invitations' })
  .get(
    '/:slug',
    async ({ params, query, set }) => {
      const invitation = await db.query.invitations.findFirst({
        where: and(eq(invitations.slug, params.slug), eq(invitations.isPublished, true)),
        with: {
          media: { orderBy: [asc(mediaAssets.sortOrder)] },
          wishes: {
            where: eq(wishes.status, 'approved'),
            orderBy: [desc(wishes.createdAt)],
            limit: 100,
          },
        },
      });
      if (!invitation) {
        set.status = 404;
        return { error: 'Invitation not found' };
      }

      // Personalized link: /:slug?guest=<unique_slug>
      let guest = null;
      if (query.guest) {
        guest =
          (await db.query.guests.findFirst({
            where: and(
              eq(guests.uniqueSlug, query.guest),
              eq(guests.invitationId, invitation.id),
            ),
          })) ?? null;
      }

      return { ...invitation, guest };
    },
    {
      params: slugParams,
      query: t.Object({ guest: t.Optional(t.String({ maxLength: 80 })) }),
    },
  )
  .post(
    '/:slug/rsvp',
    async ({ params, body, set }) => {
      const invitation = await findPublishedInvitation(params.slug);
      if (!invitation) {
        set.status = 404;
        return { error: 'Invitation not found' };
      }

      let guestId: number | null = null;
      if (body.guestSlug) {
        const guest = await db.query.guests.findFirst({
          where: and(
            eq(guests.uniqueSlug, body.guestSlug),
            eq(guests.invitationId, invitation.id),
          ),
        });
        guestId = guest?.id ?? null;
      }

      const [created] = await db
        .insert(rsvps)
        .values({
          invitationId: invitation.id,
          guestId,
          guestName: body.guestName.trim(),
          attendanceStatus: body.attendanceStatus,
          paxCount: body.paxCount ?? 1,
          message: body.message?.trim() || null,
        })
        .returning();

      set.status = 201;
      return created;
    },
    {
      params: slugParams,
      body: t.Object({
        guestName: t.String({ minLength: 1, maxLength: 120 }),
        attendanceStatus: t.Union([
          t.Literal('attending'),
          t.Literal('not_attending'),
          t.Literal('tentative'),
        ]),
        paxCount: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
        message: t.Optional(t.String({ maxLength: 500 })),
        guestSlug: t.Optional(t.String({ maxLength: 80 })),
      }),
    },
  )
  .post(
    '/:slug/wishes',
    async ({ params, body, set }) => {
      const invitation = await findPublishedInvitation(params.slug);
      if (!invitation) {
        set.status = 404;
        return { error: 'Invitation not found' };
      }

      const [created] = await db
        .insert(wishes)
        .values({
          invitationId: invitation.id,
          guestName: body.guestName.trim(),
          message: body.message.trim(),
          status: 'pending',
        })
        .returning();

      set.status = 201;
      return created;
    },
    {
      params: slugParams,
      body: t.Object({
        guestName: t.String({ minLength: 1, maxLength: 120 }),
        message: t.String({ minLength: 1, maxLength: 500 }),
      }),
    },
  );
