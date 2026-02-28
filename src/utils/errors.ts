/**
 * Translate common Supabase/OAuth error messages to Russian.
 * Falls back to original message for unknown errors.
 */

const ERROR_MAP: Record<string, string> = {
  // Supabase auth
  'Invalid login credentials': 'Неверный email или пароль',
  'Email not confirmed': 'Email не подтверждён. Проверьте почту.',
  'User already registered': 'Пользователь с таким email уже зарегистрирован',
  'Password should be at least 6 characters':
    'Пароль должен быть не менее 6 символов',
  'For security purposes, you can only request this after':
    'Слишком много попыток. Попробуйте позже.',
  'Email rate limit exceeded': 'Слишком много запросов. Попробуйте позже.',
  'Unable to validate email address: invalid format':
    'Некорректный формат email',
  'Signups not allowed for this instance':
    'Регистрация временно недоступна',
  'A user with this email address has already been registered':
    'Пользователь с таким email уже зарегистрирован',
  'New password should be different from the old password':
    'Новый пароль должен отличаться от текущего',

  // OAuth / network
  'Network request failed': 'Нет подключения к интернету',
  'NETWORK_ERROR': 'Нет подключения к интернету',
  'DEVELOPER_ERROR':
    'Ошибка конфигурации Google Sign-In. Обратитесь в поддержку.',
  'SIGN_IN_CANCELLED': '',  // User cancelled — not shown

  // Generic
  'fetch failed': 'Нет подключения к серверу',
};

export function translateError(error: string): string {
  // Exact match
  const exact = ERROR_MAP[error];
  if (exact !== undefined) return exact;

  // Partial match
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (error.includes(key)) return value;
  }

  return error;
}
