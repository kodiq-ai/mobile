import type { Session } from '@supabase/supabase-js';

import { SUPABASE_PROJECT_REF } from '../config';

export const STORAGE_KEY = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
const COOKIE_BASE = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

/**
 * Build JS to inject session into WebView (localStorage + cookies).
 * Runs BEFORE page content loads so Supabase client picks up the session.
 */
export function buildSessionInjectionJS(session: Session): string {
  const sessionJSON = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user,
  });

  // Chunk the encoded session for cookies (max ~3500 chars per cookie)
  const encoded = encodeURIComponent(sessionJSON);
  const CHUNK_SIZE = 3500;
  const chunks: string[] = [];
  for (let i = 0; i < encoded.length; i += CHUNK_SIZE) {
    chunks.push(encoded.slice(i, i + CHUNK_SIZE));
  }

  const cookieStatements = chunks
    .map(
      (chunk, i) =>
        `document.cookie = '${COOKIE_BASE}.${i}=${chunk}; path=/; domain=.kodiq.ai; secure; samesite=lax; max-age=604800';`,
    )
    .join('\n');

  return `
    (function() {
      try {
        window.__KODIQ_NATIVE__ = true;
        document.body.style.overscrollBehavior = 'none';

        // 1. localStorage for client-side Supabase
        localStorage.setItem('${STORAGE_KEY}', ${JSON.stringify(sessionJSON)});

        // 2. Chunked cookies for server-side Supabase (middleware)
        ${cookieStatements}
      } catch(e) {
        console.error('[Native] Session injection failed', e);
      }
      true;
    })();
  `;
}

/** Build JS to navigate WebView via Next.js router (SPA, no reload) */
export function buildNavigateJS(path: string): string {
  return `
    (function() {
      try {
        var msg = JSON.stringify({ type: 'navigate', path: ${JSON.stringify(
          path,
        )} });
        window.dispatchEvent(new MessageEvent('message', { data: msg }));
      } catch(e) {
        window.location.href = 'https://kodiq.ai/academy' + ${JSON.stringify(
          path,
        )};
      }
      true;
    })();
  `;
}

/** Minimal JS when no session — just set native flag */
export const INJECTED_JS_NO_SESSION = `
  (function() {
    window.__KODIQ_NATIVE__ = true;
    document.body.style.overscrollBehavior = 'none';
    true;
  })();
`;
