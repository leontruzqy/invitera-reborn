import { eq } from 'drizzle-orm';
import { DEFAULT_PALETTE } from '@invitera/shared';
import { client, db } from './client';
import {
  customers,
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
  const slug = 'rani-raka';
  const existing = await db.query.invitations.findFirst({ where: eq(invitations.slug, slug) });
  if (existing) {
    console.log(`• sample invitation /${slug} already exists, skipping`);
    return;
  }

  const [customer] = await db
    .insert(customers)
    .values({
      name: 'Rani Maharani',
      phone: '+62 812-3456-7890',
      email: 'rani.maharani@example.com',
      instagram: '@ranimaharani',
      notes: 'The bride. Found us via Instagram ads.',
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

  // Akad date drives the countdown and hero date.
  const akadDate = new Date(Date.now() + 60 * DAY_MS);
  akadDate.setHours(9, 0, 0, 0);
  const resepsiDate = new Date(akadDate);
  resepsiDate.setHours(11, 0, 0, 0);
  const rsvpDeadline = new Date(akadDate.getTime() - 27 * DAY_MS);

  const [invitation] = await db
    .insert(invitations)
    .values({
      customerId: customer.id,
      orderId: order.id,
      slug,
      brideName: 'Rani Maharani',
      groomName: 'Raka Pratama',
      brideShortName: 'Rani',
      groomShortName: 'Raka',
      brideParents: 'Bapak H. Bambang Wijaya\n& Ibu Hj. Dewi Lestari',
      groomParents: 'Bapak H. Ahmad Subarjo\n& Ibu Hj. Siti Aminah',
      brideTagline: 'Putri dari Pasangan',
      groomTagline: 'Putra dari Pasangan',
      eventDate: akadDate,
      venueName: 'The White House',
      venueAddress: 'Jl. Merdeka No. 27, Menteng, Jakarta Pusat',
      mapsUrl: 'https://maps.google.com/?q=The+White+House+Menteng+Jakarta',
      openingGreeting: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
      verseArabic:
        'وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً ۗ اِنَّ فِيْ ذٰلِكَ لَاٰيٰتٍ لِّقَوْمٍ يَّتَفَكَّرُوْنَ',
      verseTranslation:
        '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."',
      verseReference: 'QS. Ar-Rum (30) : 21',
      closingMessage:
        'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
      hashtag: '#RaniWedsRaka',
      rsvpDeadline,
      templateKey: 'rani-raka',
      themeConfigJson: JSON.stringify({
        palette: DEFAULT_PALETTE,
        heroStyle: 'gate',
        motion: true,
        birds: 7,
      }),
      isPublished: true,
    })
    .returning();

  await db.insert(invitationEvents).values([
    {
      invitationId: invitation.id,
      name: 'Akad Nikah',
      eventDate: akadDate,
      timeLabel: '09.00 – 10.00 WIB',
      venueName: 'Masjid Agung Al-Azhar',
      venueAddress: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan',
      mapsUrl: 'https://maps.google.com/?q=Masjid+Agung+Al-Azhar+Jakarta',
      sortOrder: 0,
    },
    {
      invitationId: invitation.id,
      name: 'Resepsi',
      eventDate: resepsiDate,
      timeLabel: '11.00 – 14.00 WIB',
      venueName: 'The White House',
      venueAddress: 'Jl. Merdeka No. 27, Menteng, Jakarta Pusat',
      mapsUrl: 'https://maps.google.com/?q=The+White+House+Menteng+Jakarta',
      sortOrder: 1,
    },
  ]);

  await db.insert(loveStoryEvents).values([
    {
      invitationId: invitation.id,
      title: 'Awal Bertemu',
      whenLabel: '2021',
      description:
        'Takdir mempertemukan kami pada sebuah acara kampus. Dari obrolan sederhana yang berlanjut hingga larut, tumbuh rasa nyaman yang tak terucap — awal dari sebuah kisah yang tak pernah kami rencanakan.',
      sortOrder: 0,
    },
    {
      invitationId: invitation.id,
      title: 'Lamaran',
      whenLabel: '2025',
      description:
        'Setelah perjalanan yang menguatkan, ia datang kepada keluarga dengan niat yang tulus. Di hadapan kedua keluarga, janji untuk melangkah lebih serius pun diikat dengan penuh syukur dan doa.',
      sortOrder: 1,
    },
    {
      invitationId: invitation.id,
      title: 'Pernikahan',
      whenLabel: '2026',
      description:
        'Dengan memohon ridho Allah Subhanahu wa Ta’ala, kami menyatukan dua hati dalam ikatan suci. Sebuah babak baru yang kami mulai bersama, semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah.',
      sortOrder: 2,
    },
  ]);

  await db.insert(giftAccounts).values([
    {
      invitationId: invitation.id,
      type: 'bank',
      bankName: 'Bank BCA',
      accountNumber: '1234 5678 901',
      accountName: 'Rani Maharani',
      sortOrder: 0,
    },
    {
      invitationId: invitation.id,
      type: 'bank',
      bankName: 'Bank Mandiri',
      accountNumber: '0987 6543 210',
      accountName: 'Raka Pratama',
      sortOrder: 1,
    },
    {
      invitationId: invitation.id,
      type: 'address',
      bankName: 'Kirim Hadiah',
      accountName: 'Rani & Raka',
      address:
        'Jl. Merdeka No. 27, RT 03 / RW 05,\nKel. Menteng, Jakarta Pusat, DKI Jakarta 10310',
      sortOrder: 2,
    },
  ]);

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
        'Selamat menempuh hidup baru, Rani & Raka! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.',
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
      slot: 'bride',
      url: 'https://picsum.photos/seed/invitera-bride/600/600',
      altText: 'Foto mempelai wanita',
      sortOrder: 0,
    },
    {
      invitationId: invitation.id,
      type: 'image',
      slot: 'groom',
      url: 'https://picsum.photos/seed/invitera-groom/600/600',
      altText: 'Foto mempelai pria',
      sortOrder: 0,
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      invitationId: invitation.id,
      type: 'image' as const,
      slot: 'gallery' as const,
      url: `https://picsum.photos/seed/invitera-g${i + 1}/800/800`,
      altText: `Momen kami ${i + 1}`,
      sortOrder: i,
    })),
  ]);

  console.log(
    `✔ sample data created: customer #${customer.id}, order #${order.id}, invitation /${slug} (published)`,
  );
}

await seedAdmin();
await seedSampleData();
client.close();
console.log('Seed complete.');
