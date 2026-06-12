<script setup lang="ts">
import {
  isValidJsonObject,
  isValidSlug,
  TEMPLATE_KEYS,
  TEMPLATE_LABELS,
  type Customer,
  type Order,
  type TemplateKey,
} from '@invitera/shared';
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { api, ApiError, type InvitationDetail } from '../lib/api';
import { guestInvitationUrl, publicInvitationUrl } from '../lib/config';
import { formatDate, inputToIso, toDatetimeLocal } from '../lib/format';

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
  customerId: 0,
  orderId: 0,
  eventDate: '',
  venueName: '',
  venueAddress: '',
  mapsUrl: '',
  templateKey: 'modern-minimal' as TemplateKey,
  themeConfigJson: '{}',
  isPublished: false,
});

const publicUrl = computed(() =>
  invitation.value ? publicInvitationUrl(invitation.value.slug) : null,
);

const themeJsonError = computed(() =>
  isValidJsonObject(form.themeConfigJson) ? null : 'Must be a valid JSON object, e.g. {"accent": "#be123c"}',
);
const slugError = computed(() =>
  isValidSlug(form.slug) ? null : 'Lowercase kebab-case, 3-64 chars (a-z, 0-9, dashes)',
);

function fillForm(data: InvitationDetail) {
  Object.assign(form, {
    slug: data.slug,
    brideName: data.brideName,
    groomName: data.groomName,
    customerId: data.customerId,
    orderId: data.orderId ?? 0,
    eventDate: toDatetimeLocal(data.eventDate),
    venueName: data.venueName ?? '',
    venueAddress: data.venueAddress ?? '',
    mapsUrl: data.mapsUrl ?? '',
    templateKey: data.templateKey,
    themeConfigJson: data.themeConfigJson || '{}',
    isPublished: data.isPublished,
  });
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
      customerId: Number(form.customerId),
      orderId: form.orderId ? Number(form.orderId) : null,
      eventDate: inputToIso(form.eventDate),
      venueName: form.venueName || null,
      venueAddress: form.venueAddress || null,
      mapsUrl: form.mapsUrl || null,
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
      `Delete invitation "/${invitation.value.slug}"? Its guests, RSVPs, wishes and media are deleted too.`,
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
          <a
            v-if="publicUrl"
            class="btn-secondary btn-sm"
            :href="publicUrl"
            target="_blank"
            rel="noopener"
          >
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
        <!-- Left column: main fields -->
        <div class="card space-y-4 lg:col-span-2">
          <h2 class="text-sm font-semibold text-slate-700">Invitation details</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="e-bride">Bride name *</label>
              <input id="e-bride" v-model="form.brideName" class="input" required maxlength="120" />
            </div>
            <div>
              <label class="label" for="e-groom">Groom name *</label>
              <input id="e-groom" v-model="form.groomName" class="input" required maxlength="120" />
            </div>
            <div>
              <label class="label" for="e-slug">Slug (URL) *</label>
              <input id="e-slug" v-model="form.slug" class="input font-mono" required maxlength="64" />
              <p v-if="slugError" class="mt-1 text-xs text-red-500">{{ slugError }}</p>
            </div>
            <div>
              <label class="label" for="e-date">Event date &amp; time</label>
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
              <label class="label" for="e-venue">Venue name</label>
              <input id="e-venue" v-model="form.venueName" class="input" maxlength="200" />
            </div>
            <div class="sm:col-span-2">
              <label class="label" for="e-address">Venue address</label>
              <textarea id="e-address" v-model="form.venueAddress" class="input" rows="2" maxlength="500" />
            </div>
            <div class="sm:col-span-2">
              <label class="label" for="e-maps">Google Maps URL</label>
              <input id="e-maps" v-model="form.mapsUrl" class="input" type="url" maxlength="500" placeholder="https://maps.google.com/…" />
            </div>
          </div>
        </div>

        <!-- Right column: template, theme, publish -->
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

          <div class="card">
            <h2 class="text-sm font-semibold text-slate-700">Theme config (JSON)</h2>
            <textarea
              v-model="form.themeConfigJson"
              class="input mt-3 font-mono text-xs"
              rows="5"
              spellcheck="false"
            />
            <p v-if="themeJsonError" class="mt-1 text-xs text-red-500">{{ themeJsonError }}</p>
            <p class="mt-2 text-xs text-slate-400">
              Supported keys: <code>accent</code> (CSS color), <code>coverImageUrl</code>.
            </p>
          </div>

          <div class="card">
            <label class="flex cursor-pointer items-center justify-between">
              <span>
                <span class="block text-sm font-semibold text-slate-700">Published</span>
                <span class="block text-xs text-slate-400">
                  Draft invitations return 404 on the public site.
                </span>
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

      <!-- Guests (read-only, for personalized links) -->
      <div class="card mt-6">
        <h2 class="text-sm font-semibold text-slate-700">
          Guests ({{ invitation.guests.length }})
        </h2>
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
