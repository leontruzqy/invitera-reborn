<script setup lang="ts">
import type { Customer } from '@invitera/shared';
import { onMounted, reactive, ref } from 'vue';
import { api, ApiError } from '../lib/api';
import { formatDate } from '../lib/format';

const customers = ref<Customer[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const editing = ref<Customer | null>(null);
const saving = ref(false);

const blank = { name: '', phone: '', email: '', instagram: '', notes: '' };
const form = reactive({ ...blank });

async function load() {
  loading.value = true;
  error.value = null;
  try {
    customers.value = await api.customers.list();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load customers';
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openCreate() {
  editing.value = null;
  Object.assign(form, blank);
  showForm.value = true;
}

function openEdit(customer: Customer) {
  editing.value = customer;
  Object.assign(form, {
    name: customer.name,
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    instagram: customer.instagram ?? '',
    notes: customer.notes ?? '',
  });
  showForm.value = true;
}

async function save() {
  saving.value = true;
  error.value = null;
  const payload = {
    name: form.name,
    phone: form.phone || null,
    email: form.email || null,
    instagram: form.instagram || null,
    notes: form.notes || null,
  };
  try {
    if (editing.value) await api.customers.update(editing.value.id, payload);
    else await api.customers.create(payload);
    showForm.value = false;
    await load();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to save customer';
  } finally {
    saving.value = false;
  }
}

async function remove(customer: Customer) {
  if (
    !confirm(`Delete customer "${customer.name}"? Their orders and invitations are deleted too.`)
  ) {
    return;
  }
  try {
    await api.customers.remove(customer.id);
    await load();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to delete customer';
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Customers</h1>
        <p class="mt-1 text-sm text-slate-500">People who order invitations from you.</p>
      </div>
      <button class="btn-primary" type="button" @click="openCreate">+ New customer</button>
    </div>

    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

    <Transition name="fade">
      <form v-if="showForm" class="card mt-6 space-y-4" @submit.prevent="save">
        <h2 class="text-sm font-semibold text-slate-700">
          {{ editing ? `Edit: ${editing.name}` : 'New customer' }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="c-name">Name *</label>
            <input id="c-name" v-model="form.name" class="input" required maxlength="120" />
          </div>
          <div>
            <label class="label" for="c-phone">Phone / WhatsApp</label>
            <input id="c-phone" v-model="form.phone" class="input" maxlength="40" />
          </div>
          <div>
            <label class="label" for="c-email">Email</label>
            <input id="c-email" v-model="form.email" class="input" type="email" maxlength="120" />
          </div>
          <div>
            <label class="label" for="c-instagram">Instagram</label>
            <input id="c-instagram" v-model="form.instagram" class="input" maxlength="80" placeholder="@username" />
          </div>
        </div>
        <div>
          <label class="label" for="c-notes">Notes</label>
          <textarea id="c-notes" v-model="form.notes" class="input" rows="2" maxlength="2000" />
        </div>
        <div class="flex gap-2">
          <button class="btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <button class="btn-secondary" type="button" @click="showForm = false">Cancel</button>
        </div>
      </form>
    </Transition>

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full min-w-[640px]">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th class="th">Name</th>
            <th class="th">Phone</th>
            <th class="th">Email</th>
            <th class="th">Instagram</th>
            <th class="th">Created</th>
            <th class="th"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td class="td py-8 text-center text-slate-400" colspan="6">Loading…</td>
          </tr>
          <tr v-else-if="customers.length === 0">
            <td class="td py-8 text-center text-slate-400" colspan="6">No customers yet.</td>
          </tr>
          <template v-else>
            <tr v-for="customer in customers" :key="customer.id" class="hover:bg-slate-50">
              <td class="td font-medium text-slate-800">{{ customer.name }}</td>
              <td class="td">{{ customer.phone ?? '—' }}</td>
              <td class="td">{{ customer.email ?? '—' }}</td>
              <td class="td">{{ customer.instagram ?? '—' }}</td>
              <td class="td">{{ formatDate(customer.createdAt) }}</td>
              <td class="td text-right whitespace-nowrap">
                <button class="btn-secondary btn-sm" type="button" @click="openEdit(customer)">
                  Edit
                </button>
                <button class="btn-danger btn-sm ml-2" type="button" @click="remove(customer)">
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
