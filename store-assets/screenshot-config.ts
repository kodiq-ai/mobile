/**
 * Store screenshot generation config for kodiq/mobile.
 *
 * Used by: bun auto screenshots -p kodiq/mobile
 * Generator: /opt/automation/agents/mobile/screenshot-gen.ts
 *
 * Raw screenshots are in screenshots/{en,ru}/ (captured from app per locale).
 * Each locale uses its own raw screenshots with locale-specific marketing captions.
 */

export const BRAND = {
  background: '#0c0c0c',
  textColor: '#f5f5f0',
  accent: '#c4a882',
  appName: 'Kodiq',

  mood: 'Premium, dark, warm. Confident and aspirational — like a luxury tech brand. NOT corporate, NOT playful. Think Apple product pages meets Linear app',
  typography:
    'Bold clean sans-serif (like Inter or SF Pro Display), warm white (#f5f5f0). Headlines large and impactful, subtitle smaller and muted',
  elements:
    'Subtle warm radial glow (#c4a882 at 10-15% opacity). Very dark background, almost black. No grid, no particles, no geometric patterns — just clean dark space with a hint of warmth',
  references:
    'Apple product pages, Linear app, Superhuman, Arc Browser store screenshots',
  accentRule:
    'Warm gold (#c4a882) is the ONLY accent color. Use it sparingly — for glow, highlights, keywords. No blue, no purple, no cyan, no green. ONLY gold and warm white on dark',
};

export const SLIDES = [
  // ── Slide 1: GRAPHIC — Hero / brand hook ──
  {
    type: 'graphic' as const,
    id: '01-hero',
    captions: {
      en: 'AI Solo Founder\nProgram',
      ru: 'Программа\nAI Solo Founder',
    },
    scene:
      "A cinematic dark scene. In the center — the Kodiq 'K' logo mark (white, geometric) floating above a warm gold glowing orb. " +
      'Below the logo: large bold headline in warm white. Under it — a subtle tagline in muted gold. ' +
      'Background: deep black with a smooth warm radial gradient emanating from the center (gold at ~10% opacity). ' +
      'Vibe: like a luxury product launch keynote opening slide. NO phone, NO device. Premium and aspirational.',
  },

  // ── Slide 2: SCREENSHOT — Landing page ──
  {
    type: 'screenshot' as const,
    id: '02-landing',
    rawFiles: {
      en: 'screenshots/en/01-hero.png',
      ru: 'screenshots/ru/01-hero.png',
    },
    captions: {
      en: '312 Lessons. Zero to SaaS',
      ru: '312 уроков. С нуля до SaaS',
    },
    scene:
      'Phone shown STRAIGHT-ON, perfectly centered, floating with a soft drop shadow below. ' +
      'Caption at the TOP in large bold text. ' +
      'Background: solid dark (#0c0c0c) with a very faint warm glow (#c4a882 at 8%) radiating from behind the phone center. ' +
      'Clean, premium, lots of breathing room around the phone.',
  },

  // ── Slide 3: SCREENSHOT — Skill Map ──
  {
    type: 'screenshot' as const,
    id: '03-skillmap',
    rawFiles: {
      en: 'screenshots/en/08-skillmap.png',
      ru: 'screenshots/ru/08-skillmap.png',
    },
    captions: {
      en: 'Your Learning Path',
      ru: 'Твой путь обучения',
    },
    scene:
      'Phone TILTED ~15° to the right, perspective view as if hovering above a surface. ' +
      'Subtle gold reflection on the surface below the phone. ' +
      'Caption at the TOP LEFT, left-aligned, bold. ' +
      'Background: dark gradient from top-left (slightly lighter) to bottom-right (pure black). ' +
      'Dynamic feel, like the phone is being presented to you.',
  },

  // ── Slide 4: SCREENSHOT — Program curriculum ──
  {
    type: 'screenshot' as const,
    id: '04-program',
    rawFiles: {
      en: 'screenshots/en/07-program.png',
      ru: 'screenshots/ru/07-program.png',
    },
    captions: {
      en: '6 Parts. Basics to Business',
      ru: '6 частей. От основ до бизнеса',
    },
    scene:
      'Phone STRAIGHT-ON but positioned in the LOWER HALF of the image, so the caption has lots of space at the top. ' +
      'Caption at the TOP, centered, large bold text. Below the caption — a thin gold horizontal line accent (1px). ' +
      'Background: pure dark with a subtle warm vignette around the edges. ' +
      "The phone's top edge is slightly cropped — feels like it extends beyond the frame.",
  },

  // ── Slide 5: SCREENSHOT — Community feed ──
  {
    type: 'screenshot' as const,
    id: '05-feed',
    rawFiles: {
      en: 'screenshots/en/05-feed.png',
      ru: 'screenshots/ru/05-feed.png',
    },
    captions: {
      en: 'Learn With a Community',
      ru: 'Учись вместе с комьюнити',
    },
    scene:
      'TWO overlapping phones: the main phone centered showing the feed, a second phone behind it at ~10° angle (partially visible, blurred). ' +
      'Creates depth and a sense of many people using the app simultaneously. ' +
      'Caption at the TOP, centered. ' +
      'Background: dark with a very subtle warm glow between the two phones.',
  },

  // ── Slide 6: SCREENSHOT — Leaderboard ──
  {
    type: 'screenshot' as const,
    id: '06-leaderboard',
    rawFiles: {
      en: 'screenshots/en/06-leaderboard.png',
      ru: 'screenshots/ru/06-leaderboard.png',
    },
    captions: {
      en: 'Compete & Level Up',
      ru: 'Соревнуйся и расти',
    },
    scene:
      'Phone TILTED ~10° to the LEFT. ' +
      'Behind the phone — subtle gold particle/confetti effect (very sparse, elegant, not playful). Like gold dust floating. ' +
      'Caption at the TOP RIGHT, right-aligned for asymmetric composition. ' +
      'Background: dark, slightly warm gradient from bottom (warmer) to top (pure black). ' +
      'Feels competitive and celebratory but still premium.',
  },

  // ── Slide 7: SCREENSHOT — Progress dashboard ──
  {
    type: 'screenshot' as const,
    id: '07-progress',
    rawFiles: {
      en: 'screenshots/en/04-progress.png',
      ru: 'screenshots/ru/04-progress.png',
    },
    captions: {
      en: 'Track Every Step',
      ru: 'Следи за каждым шагом',
    },
    scene:
      'Phone STRAIGHT-ON, positioned slightly to the RIGHT side of the frame. ' +
      'Caption on the LEFT side, vertically centered, left-aligned — creating a magazine-style split layout. ' +
      'A thin vertical gold accent line between the text and phone. ' +
      'Background: pure dark. Sophisticated editorial layout.',
  },

  // ── Slide 8: GRAPHIC — CTA ──
  {
    type: 'graphic' as const,
    id: '08-cta',
    captions: {
      en: '7 Days Free\nStart Building Today',
      ru: '7 дней бесплатно\nНачни строить сегодня',
    },
    scene:
      'A prominent warm gold glowing ring/circle in the center of a dark background — like a solar eclipse or portal. ' +
      "Inside the ring — the headline text in bold warm white. Below the ring — a sleek pill-shaped button with 'Start free' text. " +
      'The gold ring emits a soft warm light that fades into the dark edges. ' +
      'Vibe: invitation, warmth, opportunity. Like looking through a golden doorway. ' +
      'NO phone, NO device. Pure branded graphic.',
  },
];

export const FEATURE_GRAPHIC = {
  logoFile: 'screenshots/logo-wordmark.png',
  captions: {
    en: 'Learn to build products\nwith AI',
    ru: 'Научись создавать продукты\nс помощью AI',
  },
  layout:
    'Logo on the LEFT at ~25% width. Caption on the RIGHT, left-aligned. ' +
    'Background: dark (#0c0c0c) with a subtle warm gold diagonal gradient stripe from bottom-left to top-right (very faint). ' +
    "Below the caption — small text '312 lessons · AI Mentor · Gamification' in muted gold. " +
    'ONLY use gold (#c4a882) and warm white (#f5f5f0) colors. No blue, no cyan.',
};
