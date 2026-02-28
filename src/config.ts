/** Base URL for the Academy web app */
export const ACADEMY_URL = 'https://kodiq.ai/academy';

/** Origins allowed to load in the WebView */
export const ALLOWED_ORIGINS = [
  'https://kodiq.ai',
  // Supabase Auth (Google / GitHub OAuth redirects)
  'https://accounts.google.com',
  'https://github.com',
  'https://api.github.com',
] as const;

/** App theme colors matching Kodiq web */
export const COLORS = {
  background: '#141416',
  accent: '#06b6d4',
  text: '#fafafa',
  textMuted: '#71717a',
  border: '#27272a',
} as const;
