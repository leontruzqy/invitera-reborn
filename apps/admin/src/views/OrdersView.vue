<script setup lang="ts">
import {
  ORDER_STATUSES,
  PACKAGE_TYPES,
  PAYMENT_STATUSES,
  type Customer,
  type Order,
  type OrderStatus,
  type PackageType,
  type PaymentStatus,
} from '@invitera/shared';
import { onMounted, reactive, ref } from 'vue';
import { api, ApiError } from '../lib/api';
import { formatDate, formatIDR, inputToIso, toDateInput } from '../lib/format';

const orders = ref<Order[]>([]);
const customers = ref<Customer[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const editing = ref<Order | null>(null);
const saving = ref(false);

const blank = {
  customerId: 0,
  packageType: 'basic' as PackageType,
  price: 0,
  paymentStatus: 'unpaid' as PaymentStatus,
  orderStatus: 'pending' as OrderStatus,
  deadline: '',
};
const form = reactive({ ...blank });

const paymentBadge: Record<PaymentStatus, string> = {
  unpaid: 'bg-red-50 text-red-600',
  partial: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-600',
  refunded: 'bg-slate-100 text-slate-500',
};
const statusBadge: Record<OrderStatus, string> = {
  pending: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-600',
  review: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-500',
};

async function load() {
  loading.value = true;
  error.value = null;
  try {
    [orders.value, customers.value] = await Promise.all([
      api.orders.list(),
      api.customers.list(),
    ]);
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to load orders';
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openCreate() {
  editing.value = null;
  Object.assign(form, blank, { customerId: customers.value[0]?.id ?? 0 });
  showForm.value = true;
}

function openEdit(order: Order) {
  editing.value = order;
  Object.assign(form, {
    customerId: order.customerId,
    packageType: order.packageType,
    price: order.price,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    deadline: toDateInput(order.deadline),
  });
  showForm.value = true;
}

async function save() {
  saving.value = true;
  error.value = null;
  const payload = {
    customerId: Number(form.customerId),
    packageType: form.packageType,
    price: Number(form.price) || 0,
    paymentStatus: form.paymentStatus,
    orderStatus: form.orderStatus,
    deadline: inputToIso(form.deadline),
  };
  try {
    if (editing.value) await api.orders.update(editing.value.id, payload);
    else await api.orders.create(payload);
    showForm.value = false;
    await load();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to save order';
  } finally {
    saving.value = false;
  }
}

async function remove(order: Order) {
  if (!confirm(`Delete order #${order.id}? Linked invitations are kept (order is detached).`)) {
    return;
  }
  try {
    await api.orders.remove(order.id);
    await load();
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Failed to delete order';
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Orders</h1>
        <p class="mt-1 text-sm text-slate-500">Invitation packages ordered by customers.</p>
      </div>
      <button class="btn-primary" type="button" :disabled="customers.length === 0" @click="openCreate">
        + New order
      </button>
    </div>

    <p v-if="!loading && customers.length === 0" class="mt-4 text-sm text-amber-600">
      Create a customer first — orders must belong to a customer.
    </p>
    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

    <Transition name="fade">
      <form v-if="showForm" class="card mt-6 space-y-4" @submit.prevent="save">
        <h2 class="text-sm font-semibold text-slate-700">
          {{ editing ? `Edit order #${editing.id}` : 'New order' }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="label" for="o-customer">Customer *</label>
            <select id="o-customer" v-model.number="form.customerId" class="input" required>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="label" for="o-package">Package *</label>
            <select id="o-package" v-model="form.packageType" class="input">
              <option v-for="type in PACKAGE_TYPES" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div>
            <label class="label" for="o-price">Price (IDR) *</label>
            <input id="o-price" v-model.number="form.price" class="input" type="number" min="0" step="1000" required />
          </div>
          <div>
            <label class="label" for="o-payment">Payment status</label>
            <select id="o-payment" v-model="form.paymentStatus" class="input">
              <option v-for="status in PAYMENT_STATUSES" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>
          <div>
            <label class="label" for="o-status">Order status</label>
            <select id="o-status" v-model="form.orderStatus" class="input">
              <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
                {{ status.replace('_', ' ') }}
              </option>
            </select>
          </div>
          <div>
            <label class="label" for="o-deadline">Deadline</label>
            <input id="o-deadline" v-model="form.deadline" class="input" type="date" />
          </div>
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
      <table class="w-full min-w-[760px]">
        <thead class="border-b border-slate-200 bg-slate-50">
          <tr>
            <th class="th">#</th>
            <th class="th">Customer</th>
            <th class="th">Package</th>
            <th class="th">Price</th>
            <th class="th">Payment</th>
            <th class="th">Status</th>
            <th class="th">Deadline</th>
            <th class="th"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td class="td py-8 text-center text-slate-400" colspan="8">Loading…</td>
          </tr>
          <tr v-else-if="orders.length === 0">
            <td class="td py-8 text-center text-slate-400" colspan="8">No orders yet.</td>
          </tr>
          <template v-else>
            <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50">
              <td class="td">{{ order.id }}</td>
              <td class="td font-medium text-slate-800">{{ order.customer?.name ?? '—' }}</td>
              <td class="td capitalize">{{ order.packageType }}</td>
              <td class="td">{{ formatIDR(order.price) }}</td>
              <td class="td">
                <span class="badge" :class="paymentBadge[order.paymentStatus]">
                  {{ order.paymentStatus }}
                </span>
              </td>
              <td class="td">
                <span class="badge" :class="statusBadge[order.orderStatus]">
                  {{ order.orderStatus.replace('_', ' ') }}
                </span>
              </td>
              <td class="td">{{ formatDate(order.deadline) }}</td>
              <td class="td text-right whitespace-nowrap">
                <button class="btn-secondary btn-sm" type="button" @click="openEdit(order)">
                  Edit
                </button>
                <button class="btn-danger btn-sm ml-2" type="button" @click="remove(order)">
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
