<script setup lang="ts">
import {
  GIFT_ACCOUNT_TYPES,
  HERO_STYLES,
  isValidJsonObject,
  isValidSlug,
  MEDIA_SLOTS,
  PALETTE_PRESETS,
  parseThemeConfig,
  TEMPLATE_KEYS,
  TEMPLATE_LABELS,
  type Customer,
  type GiftAccount,
  type InvitationEvent,
  type LoveStoryEvent,
  type MediaAsset,
  type Order,
  type TemplateKey,
} from '@invitera/shared';
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { api, ApiError, type InvitationDetail } from '../lib/api';
import { guestInvitationUrl, publicInvitationUrl } from '../lib/config';
import { formatDate, inputToIso, toDatetimeLocal } from '../lib/format';
import { useChildResource } from '../composables/useChildResource';

const route = useRoute();
const router = useRouter();
const invitationId = Number(route.params.id);

const invitation = ref<InvitationDetail | null>(null);
const customers = ref<Customer[]>([]);
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const saving = ref(false);
const saved = ref(false);

const form = reactive({
  slug: '',
  brideName: '',
  groomName: '',
  brideShortName: '',
  groomShortName: '',
  brideParents: '',
  groomParents: '',
  brideTagline: '',
  groomTagline: '',
  customerId: 0,
  orderId: 0,
  eventDate: '',
  venueName: '',
  venueAddress: '',
  mapsUrl: '',
  openingGreeting: '',
  verseArabic: '',
  verseTranslation: '',
  verseReference: '',
  closingMessage: '',
  hashtag: '',
  rsvpDeadline: '',
  templateKey: 'rani-raka' as TemplateKey,
  themeConfigJson: '{}',
  isPublished: false,
});

// Structured theme tweaks layered on top of the raw themeConfigJson.
const tweaks = reactive({
  paletteIndex: 0,
  heroStyle: 'gate' as (typeof HERO_STYLES)[number],
  motion: true,
  birds: 7,
});

function orNull(v: string): string | null {
  const t = v.trim();
  return t === '' ? null : t;
}

const publicUrl = computed(() =>
  invitation.value ? publicInvitationUrl(invitation.value.slug) : null,
);
const themeJsonError = computed(() =>
  isValidJsonObject(form.themeConfigJson)
    ? null
    : 'Must be a valid JSON object, e.g. {"accent": "#be123c"}',
);
const slugError = computed(() =>
  isValidSlug(form.slug) ? null : 'Lowercase kebab-case, 3-64 chars (a-z, 0-9, dashes)',
);

// ── child resources ──
const eventsList = useChildResource<InvitationEvent>(
  invitationId,
  api.events,
  (e) => ({
    name: e.name,
    eventDate: e.eventDate,
    timeLabel: orNull(e.timeLabel ?? ''),
    venueName: orNull(e.venueName ?? ''),
    venueAddress: orNull(e.venueAddress ?? ''),
    mapsUrl: orNull(e.mapsUrl ?? ''),
    sortOrder: e.sortOrder ?? 0,
  }),
  () =>
    ({
      id: 0,
      invitationId,
      name: '',
      eventDate: null,
      timeLabel: '',
      venueName: '',
      venueAddress: '',
      mapsUrl: '',
      sortOrder: 0,
      createdAt: '',
    }) as InvitationEvent,
);

const storyList = useChildResource<LoveStoryEvent>(
  invitationId,
  api.story,
  (s) => ({
    title: s.title,
    whenLabel: orNull(s.whenLabel ?? ''),
    description: s.description,
    sortOrder: s.sortOrder ?? 0,
  }),
  () =>
    ({
      id: 0,
      invitationId,
      title: '',
      whenLabel: '',
      description: '',
      sortOrder: 0,
      createdAt: '',
    }) as LoveStoryEvent,
);

const giftsList = useChildResource<GiftAccount>(
  invitationId,
  api.gifts,
  (g) => ({
    type: g.type,
    bankName: orNull(g.bankName ?? ''),
    accountNumber: orNull(g.accountNumber ?? ''),
    accountName: orNull(g.accountName ?? ''),
    address: orNull(g.address ?? ''),
    sortOrder: g.sortOrder ?? 0,
  }),
  () =>
    ({
      id: 0,
      invitationId,
      type: 'bank',
      bankName: '',
      accountNumber: '',
      accountName: '',
      address: '',
      sortOrder: 0,
      createdAt: '',
    }) as GiftAccount,
);

const mediaList = useChildResource<MediaAsset>(
  invitationId,
  api.media,
  (m) => ({
    type: m.type,
    slot: m.slot,
    url: m.url,
    altText: orNull(m.altText ?? ''),
    sortOrder: m.sortOrder ?? 0,
  }),
  () =>
    ({
      id: 0,
      invitationId,
      type: 'image',
      slot: 'gallery',
      url: '',
      altText: '',
      sortOrder: 0,
      createdAt: '',
    }) as MediaAsset,
);

function fillForm(data: InvitationDetail) {
  Object.assign(form, {
    slug: data.slug,
    brideName: data.brideName,
    groomName: data.groomName,
    brideShortName: data.brideShortName ?? '',
    groomShortName: data.groomShortName ?? '',
    brideParents: data.brideParents ?? '',
    groomParents: data.groomParents ?? '',
    brideTagline: data.brideTagline ?? '',
    groomTagline: data.groomTagline ?? '',
    customerId: data.customerId,
    orderId: data.orderId ?? 0,
    eventDate: toDatetimeLocal(data.eventDate),
    venueName: data.venueName ?? '',
    venueAddress: data.venueAddress ?? '',
    mapsUrl: data.mapsUrl ?? '',
    openingGreeting: data.openingGreeting ?? '',
    verseArabic: data.verseArabic ?? '',
    verseTranslation: data.verseTranslation ?? '',
    verseReference: data.verseReference ?? '',
    closingMessage: data.closingMessage ?? '',
    hashtag: data.hashtag ?? '',
    rsvpDeadline: toDatetimeLocal(data.rsvpDeadline),
    templateKey: data.templateKey,
    themeConfigJson: data.themeConfigJson || '{}',
    isPublished: data.isPublished,
  });

  const theme = parseThemeConfig(data.themeConfigJson);
  const idx = PALETTE_PRESETS.findIndex((p) => p[0] === theme.palette?.[0]);
  tweaks.paletteIndex = idx >= 0 ? idx : 0;
  tweaks.heroStyle = theme.heroStyle === 'peacock' ? 'peacock' : 'gate';
  tweaks.motion = theme.motion !== false;
  tweaks.birds = typeof theme.birds === 'number' ? theme.birds : 7;

  eventsList.setItems(data.events ?? []);
  storyList.setItems(data.story ?? []);
  giftsList.setItems(data.gifts ?? []);
  mediaList.setItems(data.media ?? []);
}

/** Fold the structured tweaks into the raw themeConfigJson, keeping extra keys. */
function applyTweaks() {
  const base = parseThemeConfig(form.themeConfigJson);
  base.palette = [...PALETTE_PRESETS[tweaks.paletteIndex]];
  base.heroStyle = tweaks.heroStyle;
  base.motion = tweaks.motion;
  base.birds = tweaks.birds;
  form.themeConfigJson = JSON.stringify(base, null, 2);
}

onMounted(async () => {
  try {
    const [detail, customerList, orderList] = await Promise.all([
      api.invitations.get(invitationId),
      api.customers.list(),
      api.orders.list(),
    ]);
    invitation.value = detail;
    customers.value = customerList;
    orders.value = orderList;
    fillForm(detail);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load invitation';
  } finally {
    loading.value = false;
  }
});

async function save() {
  if (slugError.value || themeJsonError.value) return;
  saving.value = true;
  error.value = null;
  saved.value = false;
  try {
    await api.invitations.update(invitationId, {
      slug: form.slug,
      brideName: form.brideName,
      groomName: form.groomName,
      brideShortName: orNull(form.brideShortName),
      groomShortName: orNull(form.groomShortName),
      brideParents: orNull(form.brideParents),
      groomParents: orNull(form.groomParents),
      brideTagline: orNull(form.brideTagline),
      groomTagline: orNull(form.groomTagline),
      customerId: Number(form.customerId),
      orderId: form.orderId ? Number(form.orderId) : null,
      eventDate: inputToIso(form.eventDate),
      venueName: orNull(form.venueName),
      venueAddress: orNull(form.venueAddress),
      mapsUrl: orNull(form.mapsUrl),
      openingGreeting: orNull(form.openingGreeting),
      verseArabic: orNull(form.verseArabic),
      verseTranslation: orNull(form.verseTranslation),
      verseReference: orNull(form.verseReference),
      closingMessage: orNull(form.closingMessage),
      hashtag: orNull(form.hashtag),
      rsvpDeadline: inputToIso(form.rsvpDeadline),
      templateKey: form.templateKey,
      themeConfigJson: form.themeConfigJson,
      isPublished: form.isPublished,
    });
    const detail = await api.invitations.get(invitationId);
    invitation.value = detail;
    fillForm(detail);
    saved.value = true;
    setTimeout(() => (saved.value = false), 2500);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to save invitation';
  } finally {
    saving.value = false;
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard unavailable (non-HTTPS) — ignore
  }
}

async function removeInvitation() {
  if (!invitation.value) return;
  if (
    !confirm(
      `Delete invitation "/${invitation.value.slug}"? Its guests, RSVPs, wishes, events, story, gifts and media are deleted too.`,
    )
  ) {
    return;
  }
  try {
    await api.invitations.remove(invitationId);
    router.push('/invitations');
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to delete invitation';
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="py-16 text-center text-sm text-slate-400">Loading…</div>

    <template v-else-if="invitation">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <RouterLink to="/invitations" class="text-xs text-slate-400 hover:text-slate-600">
            ← Invitations
          </RouterLink>
          <h1 class="mt-1 text-2xl font-bold text-slate-800">
            {{ invitation.brideName }} &amp; {{ invitation.groomName }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            Created {{ formatDate(invitation.createdAt) }} · Customer:
            {{ invitation.customer?.name ?? '—' }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <a v-if="publicUrl" class="btn-secondary btn-sm" :href="publicUrl" target="_blank" rel="noopener">
            View page ↗
          </a>
          <RouterLink class="btn-secondary btn-sm" :to="`/invitations/${invitationId}/rsvps`">
            RSVPs
          </RouterLink>
          <RouterLink class="btn-secondary btn-sm" :to="`/invitations/${invitationId}/wishes`">
            Wishes
          </RouterLink>
          <button class="btn-danger btn-sm" type="button" @click="removeInvitation">Delete</button>
        </div>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

      <form class="mt-6 grid gap-6 lg:grid-cols-3" @submit.prevent="save">
        <!-- Left column -->
        <div class="space-y-6 lg:col-span-2">
          <div class="card space-y-4">
            <h2 class="text-sm font-semibold text-slate-700">Invitation details</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label" for="e-bride">Bride full name *</label>
                <input id="e-bride" v-model="form.brideName" class="input" required maxlength="120" />
              </div>
              <div>
                <label class="label" for="e-groom">Groom full name *</label>
                <input id="e-groom" v-model="form.groomName" class="input" required maxlength="120" />
              </div>
              <div>
                <label class="label" for="e-bride-short">Bride short name (hero)</label>
                <input id="e-bride-short" v-model="form.brideShortName" class="input" maxlength="120" placeholder="Rani" />
              </div>
              <div>
                <label class="label" for="e-groom-short">Groom short name (hero)</label>
                <input id="e-groom-short" v-model="form.groomShortName" class="input" maxlength="120" placeholder="Raka" />
              </div>
              <div>
                <label class="label" for="e-bride-tag">Bride tagline</label>
                <input id="e-bride-tag" v-model="form.brideTagline" class="input" maxlength="120" placeholder="Putri dari Pasangan" />
              </div>
              <div>
                <label class="label" for="e-groom-tag">Groom tagline</label>
                <input id="e-groom-tag" v-model="form.groomTagline" class="input" maxlength="120" placeholder="Putra dari Pasangan" />
              </div>
              <div class="sm:col-span-2">
                <label class="label" for="e-bride-parents">Bride parents</label>
                <textarea id="e-bride-parents" v-model="form.brideParents" class="input" rows="2" maxlength="300" />
              </div>
              <div class="sm:col-span-2">
                <label class="label" for="e-groom-parents">Groom parents</label>
                <textarea id="e-groom-parents" v-model="form.groomParents" class="input" rows="2" maxlength="300" />
              </div>
              <div>
                <label class="label" for="e-slug">Slug (URL) *</label>
                <input id="e-slug" v-model="form.slug" class="input font-mono" required maxlength="64" />
                <p v-if="slugError" class="mt-1 text-xs text-red-500">{{ slugError }}</p>
              </div>
              <div>
                <label class="label" for="e-date">Main event date &amp; time</label>
                <input id="e-date" v-model="form.eventDate" class="input" type="datetime-local" />
              </div>
              <div>
                <label class="label" for="e-customer">Customer *</label>
                <select id="e-customer" v-model.number="form.customerId" class="input" required>
                  <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="label" for="e-order">Order</label>
                <select id="e-order" v-model.number="form.orderId" class="input">
                  <option :value="0">— none —</option>
                  <option v-for="order in orders" :key="order.id" :value="order.id">
                    #{{ order.id }} · {{ order.customer?.name }} · {{ order.packageType }}
                  </option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="label" for="e-venue">Main venue name</label>
                <input id="e-venue" v-model="form.venueName" class="input" maxlength="200" />
              </div>
              <div class="sm:col-span-2">
                <label class="label" for="e-address">Main venue address</label>
                <textarea id="e-address" v-model="form.venueAddress" class="input" rows="2" maxlength="500" />
              </div>
              <div class="sm:col-span-2">
                <label class="label" for="e-maps">Google Maps URL</label>
                <input id="e-maps" v-model="form.mapsUrl" class="input" type="url" maxlength="500" placeholder="https://maps.google.com/…" />
              </div>
              <div>
                <label class="label" for="e-rsvp-deadline">RSVP deadline</label>
                <input id="e-rsvp-deadline" v-model="form.rsvpDeadline" class="input" type="datetime-local" />
              </div>
              <div>
                <label class="label" for="e-hashtag">Hashtag</label>
                <input id="e-hashtag" v-model="form.hashtag" class="input" maxlength="80" placeholder="#RaniWedsRaka" />
              </div>
            </div>
          </div>

          <!-- Opening / Quran verse -->
          <div class="card space-y-4">
            <h2 class="text-sm font-semibold text-slate-700">Opening &amp; verse</h2>
            <div>
              <label class="label" for="e-greeting">Opening greeting</label>
              <input id="e-greeting" v-model="form.openingGreeting" class="input" maxlength="300" placeholder="Assalamu'alaikum…" />
            </div>
            <div>
              <label class="label" for="e-verse-ar">Verse (Arabic)</label>
              <textarea id="e-verse-ar" v-model="form.verseArabic" class="input text-right" dir="rtl" rows="3" maxlength="2000" />
            </div>
            <div>
              <label class="label" for="e-verse-tr">Verse (translation)</label>
              <textarea id="e-verse-tr" v-model="form.verseTranslation" class="input" rows="3" maxlength="2000" />
            </div>
            <div>
              <label class="label" for="e-verse-ref">Verse reference</label>
              <input id="e-verse-ref" v-model="form.verseReference" class="input" maxlength="200" placeholder="QS. Ar-Rum (30) : 21" />
            </div>
            <div>
              <label class="label" for="e-closing">Closing message (footer)</label>
              <textarea id="e-closing" v-model="form.closingMessage" class="input" rows="3" maxlength="1000" />
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="space-y-6">
          <div class="card">
            <h2 class="text-sm font-semibold text-slate-700">Template</h2>
            <div class="mt-3 space-y-2">
              <label
                v-for="key in TEMPLATE_KEYS"
                :key="key"
                class="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition"
                :class="
                  form.templateKey === key
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                "
              >
                <input v-model="form.templateKey" type="radio" :value="key" class="accent-indigo-600" />
                <span>
                  {{ TEMPLATE_LABELS[key] }}
                  <span class="block font-mono text-[10px] text-slate-400">{{ key }}</span>
                </span>
              </label>
            </div>
          </div>

          <div class="card space-y-3">
            <h2 class="text-sm font-semibold text-slate-700">Theme tweaks</h2>
            <div>
              <label class="label">Palette</label>
              <div class="mt-1 flex gap-2">
                <button
                  v-for="(preset, i) in PALETTE_PRESETS"
                  :key="i"
                  type="button"
                  class="flex flex-1 items-center justify-center gap-1 rounded-lg border p-1.5 transition"
                  :class="tweaks.paletteIndex === i ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'"
                  @click="(tweaks.paletteIndex = i), applyTweaks()"
                >
                  <span
                    v-for="c in preset"
                    :key="c"
                    class="h-4 w-4 rounded-full"
                    :style="{ background: c }"
                  />
                </button>
              </div>
            </div>
            <div>
              <label class="label" for="e-hero-style">Hero style</label>
              <select id="e-hero-style" v-model="tweaks.heroStyle" class="input" @change="applyTweaks">
                <option v-for="h in HERO_STYLES" :key="h" :value="h">{{ h }}</option>
              </select>
            </div>
            <label class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Animations</span>
              <input v-model="tweaks.motion" type="checkbox" class="h-5 w-5 accent-indigo-600" @change="applyTweaks" />
            </label>
            <div>
              <label class="label" for="e-birds">Parallax birds: {{ tweaks.birds }}</label>
              <input id="e-birds" v-model.number="tweaks.birds" type="range" min="0" max="12" step="1" class="w-full accent-indigo-600" @change="applyTweaks" />
            </div>
          </div>

          <div class="card">
            <h2 class="text-sm font-semibold text-slate-700">Theme config (JSON)</h2>
            <textarea v-model="form.themeConfigJson" class="input mt-3 font-mono text-xs" rows="6" spellcheck="false" />
            <p v-if="themeJsonError" class="mt-1 text-xs text-red-500">{{ themeJsonError }}</p>
            <p class="mt-2 text-xs text-slate-400">
              Keys: <code>palette</code>, <code>heroStyle</code>, <code>motion</code>, <code>birds</code>, <code>accent</code>, <code>coverImageUrl</code>.
            </p>
          </div>

          <div class="card">
            <label class="flex cursor-pointer items-center justify-between">
              <span>
                <span class="block text-sm font-semibold text-slate-700">Published</span>
                <span class="block text-xs text-slate-400">Draft invitations return 404 on the public site.</span>
              </span>
              <input v-model="form.isPublished" type="checkbox" class="h-5 w-5 accent-indigo-600" />
            </label>
          </div>

          <div class="flex items-center gap-3">
            <button class="btn-primary flex-1" type="submit" :disabled="saving || !!slugError || !!themeJsonError">
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
            <Transition name="fade">
              <span v-if="saved" class="text-sm font-medium text-emerald-600">Saved ✓</span>
            </Transition>
          </div>
        </div>
      </form>

      <!-- Schedule events -->
      <div class="card mt-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Schedule events ({{ eventsList.items.value.length }})</h2>
          <button class="btn-secondary btn-sm" type="button" @click="eventsList.add()">+ Add event</button>
        </div>
        <p v-if="eventsList.error.value" class="mt-2 text-xs text-red-500">{{ eventsList.error.value }}</p>
        <div class="mt-3 space-y-4">
          <div v-for="(e, i) in eventsList.items.value" :key="e.id || `new-${i}`" class="rounded-lg border border-slate-200 p-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="label">Name *</label>
                <input v-model="e.name" class="input" maxlength="120" placeholder="Akad Nikah" />
              </div>
              <div>
                <label class="label">Date &amp; time</label>
                <input
                  class="input"
                  type="datetime-local"
                  :value="toDatetimeLocal(e.eventDate)"
                  @input="e.eventDate = inputToIso(($event.target as HTMLInputElement).value)"
                />
              </div>
              <div>
                <label class="label">Time label</label>
                <input v-model="e.timeLabel" class="input" maxlength="80" placeholder="09.00 – 10.00 WIB" />
              </div>
              <div>
                <label class="label">Venue name</label>
                <input v-model="e.venueName" class="input" maxlength="200" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Venue address</label>
                <input v-model="e.venueAddress" class="input" maxlength="500" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Maps URL</label>
                <input v-model="e.mapsUrl" class="input" type="url" maxlength="500" />
              </div>
              <div>
                <label class="label">Sort order</label>
                <input v-model.number="e.sortOrder" class="input" type="number" min="0" />
              </div>
            </div>
            <div class="mt-3 flex gap-2">
              <button class="btn-primary btn-sm" type="button" :disabled="eventsList.busyId.value === e.id" @click="eventsList.save(i)">Save</button>
              <button class="btn-danger btn-sm" type="button" @click="eventsList.remove(i)">Delete</button>
            </div>
          </div>
          <p v-if="!eventsList.items.value.length" class="text-sm text-slate-400">No events yet.</p>
        </div>
      </div>

      <!-- Love story -->
      <div class="card mt-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Love story ({{ storyList.items.value.length }})</h2>
          <button class="btn-secondary btn-sm" type="button" @click="storyList.add()">+ Add milestone</button>
        </div>
        <p v-if="storyList.error.value" class="mt-2 text-xs text-red-500">{{ storyList.error.value }}</p>
        <div class="mt-3 space-y-4">
          <div v-for="(s, i) in storyList.items.value" :key="s.id || `new-${i}`" class="rounded-lg border border-slate-200 p-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="label">Title *</label>
                <input v-model="s.title" class="input" maxlength="120" placeholder="Awal Bertemu" />
              </div>
              <div>
                <label class="label">When label</label>
                <input v-model="s.whenLabel" class="input" maxlength="60" placeholder="2021" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Description *</label>
                <textarea v-model="s.description" class="input" rows="3" maxlength="2000" />
              </div>
              <div>
                <label class="label">Sort order</label>
                <input v-model.number="s.sortOrder" class="input" type="number" min="0" />
              </div>
            </div>
            <div class="mt-3 flex gap-2">
              <button class="btn-primary btn-sm" type="button" :disabled="storyList.busyId.value === s.id" @click="storyList.save(i)">Save</button>
              <button class="btn-danger btn-sm" type="button" @click="storyList.remove(i)">Delete</button>
            </div>
          </div>
          <p v-if="!storyList.items.value.length" class="text-sm text-slate-400">No milestones yet.</p>
        </div>
      </div>

      <!-- Wedding gifts -->
      <div class="card mt-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Wedding gifts ({{ giftsList.items.value.length }})</h2>
          <button class="btn-secondary btn-sm" type="button" @click="giftsList.add()">+ Add gift</button>
        </div>
        <p v-if="giftsList.error.value" class="mt-2 text-xs text-red-500">{{ giftsList.error.value }}</p>
        <div class="mt-3 space-y-4">
          <div v-for="(g, i) in giftsList.items.value" :key="g.id || `new-${i}`" class="rounded-lg border border-slate-200 p-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="label">Type</label>
                <select v-model="g.type" class="input">
                  <option v-for="ty in GIFT_ACCOUNT_TYPES" :key="ty" :value="ty">{{ ty }}</option>
                </select>
              </div>
              <div>
                <label class="label">Bank / label</label>
                <input v-model="g.bankName" class="input" maxlength="120" placeholder="Bank BCA / Kirim Hadiah" />
              </div>
              <div v-if="g.type === 'bank'">
                <label class="label">Account number</label>
                <input v-model="g.accountNumber" class="input" maxlength="80" />
              </div>
              <div>
                <label class="label">Account / recipient name</label>
                <input v-model="g.accountName" class="input" maxlength="120" />
              </div>
              <div v-if="g.type === 'address'" class="sm:col-span-2">
                <label class="label">Address</label>
                <textarea v-model="g.address" class="input" rows="2" maxlength="500" />
              </div>
              <div>
                <label class="label">Sort order</label>
                <input v-model.number="g.sortOrder" class="input" type="number" min="0" />
              </div>
            </div>
            <div class="mt-3 flex gap-2">
              <button class="btn-primary btn-sm" type="button" :disabled="giftsList.busyId.value === g.id" @click="giftsList.save(i)">Save</button>
              <button class="btn-danger btn-sm" type="button" @click="giftsList.remove(i)">Delete</button>
            </div>
          </div>
          <p v-if="!giftsList.items.value.length" class="text-sm text-slate-400">No gift accounts yet.</p>
        </div>
      </div>

      <!-- Media -->
      <div class="card mt-6">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-700">Media ({{ mediaList.items.value.length }})</h2>
          <button class="btn-secondary btn-sm" type="button" @click="mediaList.add()">+ Add media</button>
        </div>
        <p class="mt-1 text-xs text-slate-400">
          Slots: <code>bride</code> / <code>groom</code> photos, <code>gallery</code> grid, plus <code>cover</code> / <code>hero</code>.
        </p>
        <p v-if="mediaList.error.value" class="mt-2 text-xs text-red-500">{{ mediaList.error.value }}</p>
        <div class="mt-3 space-y-4">
          <div v-for="(m, i) in mediaList.items.value" :key="m.id || `new-${i}`" class="rounded-lg border border-slate-200 p-3">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="label">Slot</label>
                <select v-model="m.slot" class="input">
                  <option v-for="s in MEDIA_SLOTS" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label class="label">Sort order</label>
                <input v-model.number="m.sortOrder" class="input" type="number" min="0" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">URL *</label>
                <input v-model="m.url" class="input" type="url" maxlength="1000" placeholder="https://…" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Alt text</label>
                <input v-model="m.altText" class="input" maxlength="200" />
              </div>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <button class="btn-primary btn-sm" type="button" :disabled="mediaList.busyId.value === m.id" @click="mediaList.save(i)">Save</button>
              <button class="btn-danger btn-sm" type="button" @click="mediaList.remove(i)">Delete</button>
              <img v-if="m.url" :src="m.url" alt="" class="ml-auto h-10 w-10 rounded object-cover" />
            </div>
          </div>
          <p v-if="!mediaList.items.value.length" class="text-sm text-slate-400">No media yet.</p>
        </div>
      </div>

      <!-- Guests (read-only) -->
      <div class="card mt-6">
        <h2 class="text-sm font-semibold text-slate-700">Guests ({{ invitation.guests.length }})</h2>
        <p class="mt-1 text-xs text-slate-400">
          Personalized links use <code>?guest=&lt;unique_slug&gt;</code> on the public URL.
        </p>
        <div v-if="invitation.guests.length" class="mt-3 divide-y divide-slate-100">
          <div
            v-for="guest in invitation.guests"
            :key="guest.id"
            class="flex flex-wrap items-center justify-between gap-2 py-2"
          >
            <div>
              <p class="text-sm font-medium text-slate-700">{{ guest.name }}</p>
              <p class="text-xs text-slate-400">
                {{ guest.groupName ?? '—' }} · <span class="font-mono">{{ guest.uniqueSlug }}</span>
              </p>
            </div>
            <button
              v-if="guestInvitationUrl(invitation.slug, guest.uniqueSlug)"
              class="btn-secondary btn-sm"
              type="button"
              @click="copy(guestInvitationUrl(invitation.slug, guest.uniqueSlug)!)"
            >
              Copy link
            </button>
          </div>
        </div>
        <p v-else class="mt-3 text-sm text-slate-400">No guests added yet (seeded via db:seed).</p>
      </div>
    </template>

    <div v-else class="py-16 text-center">
      <p class="text-sm text-red-600">{{ error ?? 'Invitation not found.' }}</p>
      <RouterLink to="/invitations" class="btn-secondary btn-sm mt-4">Back to invitations</RouterLink>
    </div>
  </div>
</template>
