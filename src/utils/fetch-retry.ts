/**
 * Fetch wrapper with timeout and exponential backoff retry.
 *
 * Usage:
 *   const res = await fetchWithRetry(url, { method: 'POST', body }, { retries: 3 });
 */

interface RetryOptions {
  /** Max retry attempts (default: 3) */
  retries?: number;
  /** Initial delay in ms before first retry (default: 1000) */
  baseDelay?: number;
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
}

export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions,
): Promise<Response> {
  const { retries = 3, baseDelay = 1000, timeout = 10000 } = options ?? {};

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Don't retry on client errors (4xx) — only on server/network errors
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    // Wait before next retry (exponential backoff)
    if (attempt < retries) {
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
