/**
 * Build standard auth headers for API requests.
 * Centralizes the Bearer token pattern used by push.ts endpoints.
 */
export function buildAuthHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}
