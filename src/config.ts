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
  surface: '#1c1c1e',
  accent: '#06b6d4',
  text: '#fafafa',
  textMuted: '#71717a',
  border: '#27272a',
  error: '#ef4444',
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
