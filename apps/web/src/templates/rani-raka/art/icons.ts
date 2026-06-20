import { h, type FunctionalComponent } from 'vue';

/** Inline SVG glyphs ported from the design's art.jsx, as functional components. */

export const EnvelopeIcon: FunctionalComponent = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 17,
      height: 17,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.6,
      'aria-hidden': 'true',
    },
    [
      h('rect', { x: 3, y: 5, width: 18, height: 14, rx: 2 }),
      h('path', { d: 'M3.5 6.5 L12 13 L20.5 6.5' }),
    ],
  );

export const HeartIcon: FunctionalComponent = () =>
  h(
    'svg',
    { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'currentColor', 'aria-hidden': 'true' },
    [
      h('path', {
        d: 'M12 21 C 4 14.5, 3 9, 6.5 6.5 C 9 4.7, 11 6, 12 7.7 C 13 6, 15 4.7, 17.5 6.5 C 21 9, 20 14.5, 12 21 Z',
      }),
    ],
  );

export const BankIcon: FunctionalComponent = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 18,
      height: 18,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.4,
      'aria-hidden': 'true',
    },
    [
      h('path', { d: 'M3 9 L12 3.5 L21 9 Z' }),
      h('path', { d: 'M5 9 V18 M9.5 9 V18 M14.5 9 V18 M19 9 V18' }),
      h('path', { d: 'M3.5 18 H20.5 M3 21 H21' }),
    ],
  );

export const PinIcon: FunctionalComponent = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 18,
      height: 18,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.4,
      'aria-hidden': 'true',
    },
    [
      h('path', { d: 'M12 21 C 17 15, 19 11.5 19 8.5 A7 7 0 0 0 5 8.5 C 5 11.5, 7 15, 12 21 Z' }),
      h('circle', { cx: 12, cy: 8.5, r: 2.6 }),
    ],
  );

export const CopyIcon: FunctionalComponent = () =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 14,
      height: 14,
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.5,
      'aria-hidden': 'true',
    },
    [
      h('rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }),
      h('path', { d: 'M5 15 H4 A2 2 0 0 1 2 13 V4 A2 2 0 0 1 4 2 H13 A2 2 0 0 1 15 4 V5' }),
    ],
  );
