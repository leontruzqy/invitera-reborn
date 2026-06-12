import type { TemplateKey } from '@invitera/shared';
import { defineAsyncComponent, type Component } from 'vue';

/**
 * Dynamic template registry: invitations.template_key -> Vue component.
 * Add a new template by creating the component and registering it here
 * (plus adding the key to TEMPLATE_KEYS in @invitera/shared).
 */
export const templateRegistry: Record<TemplateKey, Component> = {
  'modern-minimal': defineAsyncComponent(() => import('./ModernMinimal.vue')),
  'floral-elegant': defineAsyncComponent(() => import('./FloralElegant.vue')),
  'javanese-classic': defineAsyncComponent(() => import('./JavaneseClassic.vue')),
  'islamic-clean': defineAsyncComponent(() => import('./IslamicClean.vue')),
  'luxury-dark': defineAsyncComponent(() => import('./LuxuryDark.vue')),
};
