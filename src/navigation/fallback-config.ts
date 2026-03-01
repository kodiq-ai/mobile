import type { MobileNavConfig } from '../types/nav';

/**
 * Hardcoded fallback navigation config.
 * Used when API is unreachable and no cached config exists.
 * Mirrors the 5 web tabs: Home → Progress → [AI Mentor] → Feed → Leaderboard
 */
export const FALLBACK_NAV_CONFIG: MobileNavConfig = {
  version: 2,
  tabs: [
    {
      id: 'home',
      icon: 'Home',
      labelKey: 'nav.home',
      labelFallback: 'Главная',
      path: '/',
    },
    {
      id: 'progress',
      icon: 'BarChart',
      labelKey: 'nav.progress',
      labelFallback: 'Прогресс',
      path: '/dashboard',
    },
    {
      id: 'ai-mentor',
      icon: 'Brain',
      labelKey: 'nav.aiMentor',
      labelFallback: 'AI Ментор',
      path: '__ai_mentor__',
      style: 'raised',
    },
    {
      id: 'feed',
      icon: 'Users',
      labelKey: 'nav.feed',
      labelFallback: 'Лента',
      path: '/feed',
    },
    {
      id: 'leaderboard',
      icon: 'Trophy',
      labelKey: 'nav.leaderboard',
      labelFallback: 'Рейтинг',
      path: '/leaderboard',
    },
  ],
  drawer: [
    {
      title: 'Навигация',
      items: [
        {
          id: 'search',
          icon: 'Search',
          labelKey: 'nav.search',
          labelFallback: 'Поиск',
          path: '/search',
        },
        {
          id: 'settings',
          icon: 'Settings',
          labelKey: 'nav.settings',
          labelFallback: 'Настройки',
          path: '/settings',
        },
      ],
    },
    {
      title: 'Ссылки',
      items: [
        {
          id: 'website',
          icon: 'Globe',
          labelKey: 'nav.website',
          labelFallback: 'kodiq.ai',
          path: 'https://kodiq.ai',
          external: true,
        },
      ],
    },
  ],
  header: {
    showLogo: true,
    showNotifications: true,
    showSearch: true,
  },
};
