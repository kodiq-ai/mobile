/** Base URL for the Academy web app */
export const ACADEMY_URL = 'https://kodiq.ai/academy';

/** Server-driven navigation config endpoint */
export const NAV_CONFIG_URL = 'https://kodiq.ai/api/academy/mobile-nav';

/** Origins allowed to load in the WebView */
export const ALLOWED_ORIGINS = [
  'https://kodiq.ai',
  // Supabase Auth (Google / GitHub OAuth redirects)
  'https://accounts.google.com',
  'https://github.com',
  'https://api.github.com',
] as const;

/** App theme colors matching Kodiq web (Graphite Calm palette) */
export const COLORS = {
  background: '#141416',
  surface: '#1a1a1d',
  surfaceElevated: '#202024',
  accent: '#4da3c7',
  accentDim: 'rgba(77, 163, 199, 0.15)',
  text: '#e6e6e9',
  textMuted: '#6e6e76',
  textSecondary: '#a1a1a8',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',
  error: '#c36a6a',
  success: '#6faf8f',
  warning: '#c9a95e',
} as const;

/**
 * Google Web Client ID from Google Cloud Console.
 * Must match the client ID configured in Supabase Dashboard > Auth > Google Provider.
 * Get it from: https://console.cloud.google.com/apis/credentials (Web application type)
 */
export const GOOGLE_WEB_CLIENT_ID = '883916650071-REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com';

/** Sentry — Error Monitoring */
export const SENTRY_DSN =
  'https://51a81ca4a92130100b5ed88f706d3da8@o4510404075126784.ingest.de.sentry.io/4510966071820368';

/** PostHog analytics */
export const POSTHOG_API_KEY = 'phc_JmYTaumxd37YjQjPFJtjUEj9MiYkG9Fg9uQ2HgNbACf';
export const POSTHOG_HOST = 'https://us.i.posthog.com';

/** Supabase configuration */
export const SUPABASE_URL = 'https://rbhhktfmgtjynoashwoe.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaGhrdGZtZ3RqeW5vYXNod29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODUxMTQsImV4cCI6MjA4Njc2MTExNH0.slqNIJTnWZ1zC6WK6fzVY-d48VyyY9MzAEdLplD0KAs';
export const SUPABASE_PROJECT_REF = 'rbhhktfmgtjynoashwoe';
