/**
 * Server-driven navigation config types.
 *
 * The app fetches MobileNavConfig from the API,
 * caches in AsyncStorage, and falls back to hardcoded config.
 */

export interface MobileNavConfig {
  version: number;
  tabs: TabItem[];
  drawer: DrawerSection[];
  header: {
    showLogo: boolean;
    showNotifications: boolean;
    showSearch: boolean;
  };
}

export interface TabItem {
  id: string;
  /** Key into the predefined NavIcon map */
  icon: string;
  /** i18n key (unused for now, reserved for future) */
  labelKey: string;
  /** Fallback label text */
  labelFallback: string;
  /** Path relative to academy root, e.g. "/" or "/dashboard" */
  path: string;
  /** Badge type — 'notifications' shows unread count */
  badge?: 'notifications' | 'none';
}

export interface DrawerSection {
  title?: string;
  items: DrawerItem[];
}

export interface DrawerItem {
  id: string;
  icon: string;
  labelKey: string;
  labelFallback: string;
  path: string;
  /** If true, opens in external browser instead of WebView */
  external?: boolean;
}
