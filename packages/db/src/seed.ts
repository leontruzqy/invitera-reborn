import { eq } from 'drizzle-orm';
import { client, db } from './client';
import {
  customers,
  guests,
  invitations,
  mediaAssets,
  orders,
  rsvps,
  users,
  wishes,
} from './schema';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@invitera.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? 'Invitera Admin';

const DAY_MS = 86_400_000;

async function seedAdmin() {
  const existing = await db.query.users.findFirst({ where: eq(users.email, ADMIN_EMAIL) });
  if (existing) {
    console.log(`• admin user ${ADMIN_EMAIL} already exists, skipping`);
    return;
  }
  const passwordHash = await Bun.password.hash(ADMIN_PASSWORD, {
    algorithm: 'bcrypt',
    cost: 10,
  });
  await db.insert(users).values({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
  });
  console.log(`✔ admin user created: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
}

async function seedSampleData() {
  const slug = 'aisyah-raka';
  const existing = await db.query.invitations.findFirst({ where: eq(invitations.slug, slug) });
  if (existing) {
    console.log(`• sample invitation /${slug} already exists, skipping`);
    return;
  }

  const [customer] = await db
    .insert(customers)
    .values({
      name: 'Putri Ayu Lestari',
      phone: '+62 812-3456-7890',
      email: 'putri.ayu@example.com',
      instagram: '@putriayu',
      notes: 'Sister of the bride. Found us via Instagram ads.',
    })
    .returning();

  const [order] = await db
    .insert(orders)
    .values({
      customerId: customer.id,
      packageType: 'premium',
      price: 750_000,
      paymentStatus: 'paid',
      orderStatus: 'in_progress',
      deadline: new Date(Date.now() + 30 * DAY_MS),
    })
    .returning();

  const eventDate = new Date(Date.now() + 45 * DAY_MS);
  eventDate.setHours(10, 0, 0, 0);

  const [invitation] = await db
    .insert(invitations)
    .values({
      customerId: customer.id,
      orderId: order.id,
      slug,
      brideName: 'Aisyah Putri',
      groomName: 'Raka Pratama',
      eventDate,
      venueName: 'Pendopo Agung Graha Melati',
      venueAddress: 'Jl. Melati No. 12, Sleman, Daerah Istimewa Yogyakarta',
      mapsUrl: 'https://maps.google.com/?q=Sleman+Yogyakarta',
      templateKey: 'floral-elegant',
      themeConfigJson: JSON.stringify({ accent: '#be123c' }),
      isPublished: true,
    })
    .returning();

  const guestRows = await db
    .insert(guests)
    .values([
      {
        invitationId: invitation.id,
        name: 'Budi Santoso & Keluarga',
        phone: '+62 813-1111-2222',
        groupName: 'Keluarga',
        uniqueSlug: 'budi-santoso-x7f2',
      },
      {
        invitationId: invitation.id,
        name: 'Dewi Anggraini',
        phone: '+62 815-3333-4444',
        groupName: 'Teman Kampus',
        uniqueSlug: 'dewi-anggraini-k9q1',
      },
      {
        invitationId: invitation.id,
        name: 'Rizky Hidayat',
        phone: null,
        groupName: 'Rekan Kerja',
        uniqueSlug: 'rizky-hidayat-m3z8',
      },
    ])
    .returning();

  await db.insert(rsvps).values([
    {
      invitationId: invitation.id,
      guestId: guestRows[0].id,
      guestName: 'Budi Santoso',
      attendanceStatus: 'attending',
      paxCount: 4,
      message: 'Insya Allah kami sekeluarga hadir!',
    },
    {
      invitationId: invitation.id,
      guestId: guestRows[1].id,
      guestName: 'Dewi Anggraini',
      attendanceStatus: 'tentative',
      paxCount: 1,
      message: 'Masih menunggu jadwal kerja, semoga bisa hadir.',
    },
  ]);

  await db.insert(wishes).values([
    {
      invitationId: invitation.id,
      guestName: 'Budi Santoso',
      message:
        'Selamat menempuh hidup baru, Aisyah & Raka! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
      status: 'approved',
    },
    {
      invitationId: invitation.id,
      guestName: 'Dewi Anggraini',
      message: 'Happy wedding! Bahagia selalu sampai kakek nenek ya.',
      status: 'approved',
    },
    {
      invitationId: invitation.id,
      guestName: 'Anonim',
      message: 'This wish is pending moderation — approve it from the admin dashboard.',
      status: 'pending',
    },
  ]);

  await db.insert(mediaAssets).values([
    {
      invitationId: invitation.id,
      type: 'image',
      url: 'https://picsum.photos/seed/invitera-hero/1600/900',
      altText: 'Couple portrait',
      sortOrder: 0,
    },
    {
      invitationId: invitation.id,
      type: 'image',
      url: 'https://picsum.photos/seed/invitera-venue/1200/800',
      altText: 'Venue',
      sortOrder: 1,
    },
  ]);

  console.log(
    `✔ sample data created: customer #${customer.id}, order #${order.id}, invitation /${slug} (published)`,
  );
}

await seedAdmin();
await seedSampleData();
client.close();
console.log('Seed complete.');
