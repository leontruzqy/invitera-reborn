<script setup lang="ts">
import {
  slugify,
  TEMPLATE_LABELS,
  type Customer,
  type Invitation,
  type Order,
} from '@invitera/shared';
import { onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api, ApiError } from '../lib/api';
import { publicInvitationUrl } from '../lib/config';
import { formatDate } from '../lib/format';

const router = useRouter();

const invitations = ref<Invitation[]>([]);
const customers = ref<Customer[]>([]);
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const saving = ref(false);

const form = reactive({
  customerId: 0,
  orderId: 0,
  slug: '',
  brideName: '',
  groomName: '',
});

// Suggest a slug from the couple names until the user edits it manually.
const slugTouched = ref(false);
watch(
  () => [form.brideName, form.groomName],
  () => {
    if (!slugTouched.value) {
      form.slug = slugify(`${form.brideName} ${form.groomName}`);
    }
  },
);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    [invitations.value, customers.value, orders.value] = await Promise.all([
      api.invitations.list(),
      api.customers.list(),
      api.orders.list(),
    ]);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load invitations';
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openCreate() {
  Object.assign(form, {
    customerId: customers.value[0]?.id ?? 0,
    orderId: 0,
    slug: '',
    brideName: '',
    groomName: '',
  });
  slugTouched.value = false;
  showForm.value = true;
}

async function save() {
  saving.value = true;
  error.value = null;
  try {
    const created = await api.invitations.create({
      customerId: Number(form.customerId),
      orderId: form.orderId ? Number(form.orderId) : null,
      slug: form.slug,
      brideName: form.brideName,
      groomName: form.groomName,
    });
    router.push(`/invitations/${created.id}`);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to create invitation';
  } finally {
    saving.value = false;
  }
}

async function remove(invitation: Invitation) {
  if (
    !confirm(
      `Delete invitation "/${invitation.slug}"? Its guests, RSVPs, wishes and media are deleted too.`,
    )
  ) {
    return;
  }
  try {
    await api.invitations.remove(invitation.id);
    await load();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to delete invitation';
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Invitations</h1>
        <p class="mt-1 text-sm text-slate-500">Wedding invitation pages served by the web app.</p>
      </div>
      <button
        class="btn-primary"
        type="button"
        :disabled="customers.length === 0"
        @click="openCreate"
      >
        + New invitation
      </button>
    </div>

    <p v-if="!loading && customers.length === 0" class="mt-4 text-sm text-amber-600">
      Create a customer first — invitations must belong to a customer.
    </p>
    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

    <Transition name="fade">
      <form v-if="showForm" class="card mt-6 space-y-4" @submit.prevent="save">
        <h2 class="text-sm font-semibold text-slate-700">New invitation</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="i-bride">Bride name *</label>
            <input id="i-bride" v-model="form.brideName" class="input" required maxlength="120" />
          </div>
          <div>
            <label class="label" for="i-groom">Groom name *</label>
            <input id="i-groom" v-model="form.groomName" class="input" required maxlength="120" />
          </div>
          <div>
            <label class="label" for="i-slug">Slug (URL) *</label>
            <input
              id="i-slug"
              v-model="form.slug"
              class="input font-mono"
              required
              maxlength="64"
              placeholder="rani-raka"
              @input="slugTouched = true"
            />
          </div>
          <div>
            <label class="label" for="i-customer">Customer *</label>
            <select id="i-customer" v-model.number="form.customerId" class="input" required>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label" for="i-order">Order (optional)</label>
            <select id="i-order" v-model.number="form.orderId" class="input">
              <option :value="0">— none —</option>
              <option v-for="order in orders" :key="order.id" :value="order.id">
                #{{ order.id }} · {{ order.customer?.name }} · {{ order.packageType }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Creating…' : 'Create & edit' }}
          </button>
          <button class="btn-secondary" type="button" @click="showForm = false">Cancel</button>
        </div>
      </form>
    </Transition>

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full min-w-[820px]">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th class="th">Slug</th>
            <th class="th">Couple</th>
            <th class="th">Customer</th>
            <th class="th">Template</th>
            <th class="th">Event date</th>
            <th class="th">Status</th>
            <th class="th"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td class="td py-8 text-center text-slate-400" colspan="7">Loading…</td>
          </tr>
          <tr v-else-if="invitations.length === 0">
            <td class="td py-8 text-center text-slate-400" colspan="7">No invitations yet.</td>
          </tr>
          <template v-else>
            <tr v-for="invitation in invitations" :key="invitation.id" class="hover:bg-slate-50">
              <td class="td font-mono text-xs">
                <a
                  v-if="publicInvitationUrl(invitation.slug)"
                  :href="publicInvitationUrl(invitation.slug)!"
                  target="_blank"
                  rel="noopener"
                  class="text-indigo-600 hover:underline"
                >
                  /{{ invitation.slug }}
                </a>
                <span v-else>/{{ invitation.slug }}</span>
              </td>
              <td class="td font-medium text-slate-800">
                {{ invitation.brideName }} &amp; {{ invitation.groomName }}
              </td>
              <td class="td">{{ invitation.customer?.name ?? '—' }}</td>
              <td class="td">{{ TEMPLATE_LABELS[invitation.templateKey] }}</td>
              <td class="td">{{ formatDate(invitation.eventDate) }}</td>
              <td class="td">
                <span
                  class="badge"
                  :class="
                    invitation.isPublished
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  {{ invitation.isPublished ? 'published' : 'draft' }}
                </span>
              </td>
              <td class="td text-right whitespace-nowrap">
                <RouterLink class="btn-secondary btn-sm" :to="`/invitations/${invitation.id}`">
                  Edit
                </RouterLink>
                <button class="btn-danger btn-sm ml-2" type="button" @click="remove(invitation)">
                  Delete
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
