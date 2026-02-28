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

/** Supabase configuration */
export const SUPABASE_URL = 'https://rbhhktfmgtjynoashwoe.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaGhrdGZtZ3RqeW5vYXNod29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExODUxMTQsImV4cCI6MjA4Njc2MTExNH0.slqNIJTnWZ1zC6WK6fzVY-d48VyyY9MzAEdLplD0KAs';
export const SUPABASE_PROJECT_REF = 'rbhhktfmgtjynoashwoe';
