import { ref, type Ref } from 'vue';
import { ApiError } from '../lib/api';

export interface ChildResourceApi<T> {
  create: (invitationId: number, payload: Record<string, unknown>) => Promise<T>;
  update: (
    invitationId: number,
    childId: number,
    payload: Record<string, unknown>,
  ) => Promise<T>;
  remove: (invitationId: number, childId: number) => Promise<{ ok: boolean }>;
}

/**
 * Manages an editable list of an invitation's child rows (events, story,
 * gifts, media). New rows carry `id: 0` until saved; `save` decides between
 * create and update, and patches the row back with the server's response.
 */
export function useChildResource<T extends { id: number }>(
  invitationId: number,
  resource: ChildResourceApi<T>,
  toPayload: (item: T) => Record<string, unknown>,
  blank: () => T,
) {
  const items = ref<T[]>([]) as Ref<T[]>;
  const busyId = ref<number | null>(null);
  const error = ref<string | null>(null);

  function setItems(list: T[]) {
    items.value = list.map((x) => ({ ...x }));
  }

  function add() {
    items.value.push(blank());
  }

  async function save(index: number) {
    const item = items.value[index];
    if (!item) return;
    error.value = null;
    busyId.value = item.id;
    try {
      const saved =
        item.id > 0
          ? await resource.update(invitationId, item.id, toPayload(item))
          : await resource.create(invitationId, toPayload(item));
      items.value.splice(index, 1, { ...saved });
    } catch (err) {
      error.value = err instanceof ApiError ? err.message : 'Failed to save';
    } finally {
      busyId.value = null;
    }
  }

  async function remove(index: number) {
    const item = items.value[index];
    if (!item) return;
    if (item.id > 0) {
      error.value = null;
      busyId.value = item.id;
      try {
        await resource.remove(invitationId, item.id);
      } catch (err) {
        error.value = err instanceof ApiError ? err.message : 'Failed to delete';
        busyId.value = null;
        return;
      }
      busyId.value = null;
    }
    items.value.splice(index, 1);
  }

  return { items, busyId, error, setItems, add, save, remove };
}
