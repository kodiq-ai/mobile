import type { MobileNavConfig } from '../types/nav';

/**
 * Hardcoded fallback navigation config.
 * Used when API is unreachable and no cached config exists.
 * Mirrors the 6 web tabs from BottomTabBar.
 */
export const FALLBACK_NAV_CONFIG: MobileNavConfig = {
  version: 1,
  tabs: [
    {
      id: 'courses',
      icon: 'BookOpen',
      labelKey: 'nav.courses',
      labelFallback: 'Курсы',
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
      id: 'skill-map',
      icon: 'Map',
      labelKey: 'nav.skillMap',
      labelFallback: 'Карта',
      path: '/skill-map',
    },
    {
      id: 'review',
      icon: 'RefreshCw',
      labelKey: 'nav.review',
      labelFallback: 'Повторение',
      path: '/review',
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
      labelFallback: 'Лидеры',
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
