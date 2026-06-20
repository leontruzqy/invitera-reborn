import { onBeforeUnmount, onMounted, type Ref } from 'vue';

/**
 * Reveal-on-scroll: adds `.in` to every `.reveal` element inside `root` as it
 * enters the viewport (ported from the design's sections.jsx). Under
 * prefers-reduced-motion the CSS already forces the end-state, so we no-op.
 */
export function useReveal(root: Ref<HTMLElement | null>) {
  let observer: IntersectionObserver | null = null;

  function observe() {
    const el = root.value;
    if (!el) return;
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16 },
    );
    el.querySelectorAll('.reveal').forEach((node) => observer!.observe(node));
  }

  onMounted(() => {
    // Wait a frame so dynamic (v-for) reveal nodes are in the DOM.
    requestAnimationFrame(observe);
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { refresh: observe };
}
