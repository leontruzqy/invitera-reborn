<script setup lang="ts">
import type { PublicInvitation } from '@invitera/shared';
import { ref } from 'vue';
import { BankIcon, CopyIcon, PinIcon } from '../art/icons';
import CornerFloral from '../art/CornerFloral.vue';

defineProps<{ invitation: PublicInvitation }>();

const copied = ref<number | null>(null);

function copy(text: string | null, id: number) {
  if (!text) return;
  navigator.clipboard?.writeText(text.replace(/\n/g, ' ')).catch(() => {});
  copied.value = id;
  setTimeout(() => {
    if (copied.value === id) copied.value = null;
  }, 1800);
}
</script>

<template>
  <section v-if="invitation.gifts.length" class="block cream center" data-screen-label="Hadiah">
    <div class="corner-floral tl"><CornerFloral /></div>
    <div class="reveal"><span class="eyebrow">Tanda Kasih</span></div>
    <div class="reveal d1"><h2 class="section-title">Wedding Gift</h2></div>
    <p class="reveal d1 lead gift-intro">
      Doa restu Anda adalah karunia yang sangat berharga bagi kami. Namun apabila memberi adalah
      ungkapan tanda kasih, Anda dapat mengirimkan hadiah melalui:
    </p>

    <div class="gift-wrap">
      <div
        v-for="(g, i) in invitation.gifts"
        :key="g.id"
        class="gift-card reveal"
        :class="`d${(i % 2) + 1}`"
      >
        <template v-if="g.type === 'address'">
          <div class="gift-head">
            <span class="gift-ic"><PinIcon /></span>
            <span class="gift-bank">{{ g.bankName ?? 'Kirim Hadiah' }}</span>
          </div>
          <div class="gift-addr-name">{{ g.accountName }}</div>
          <div class="gift-row">
            <span class="gift-addr">{{ g.address }}</span>
            <button type="button" class="copy-btn" @click="copy(g.address, g.id)">
              <CopyIcon /> {{ copied === g.id ? 'Tersalin' : 'Salin' }}
            </button>
          </div>
        </template>
        <template v-else>
          <div class="gift-head">
            <span class="gift-ic"><BankIcon /></span>
            <span class="gift-bank">{{ g.bankName }}</span>
          </div>
          <div class="gift-no">{{ g.accountNumber }}</div>
          <div class="gift-row">
            <span class="gift-name">a.n. {{ g.accountName }}</span>
            <button type="button" class="copy-btn" @click="copy(g.accountNumber, g.id)">
              <CopyIcon /> {{ copied === g.id ? 'Tersalin' : 'Salin' }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
