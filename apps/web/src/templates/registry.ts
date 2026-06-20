import { DEFAULT_TEMPLATE_KEY, type TemplateKey } from '@invitera/shared';
import { defineAsyncComponent, type Component } from 'vue';

/**
 * Dynamic template registry: invitations.template_key -> Vue component.
 * Add a new template by creating the component and registering it here
 * (plus adding the key to TEMPLATE_KEYS in @invitera/shared).
 */
export const templateRegistry: Record<TemplateKey, Component> = {
  'rani-raka': defineAsyncComponent(() => import('./RaniRaka.vue')),
};

export const fallbackTemplate = templateRegistry[DEFAULT_TEMPLATE_KEY];
