import type { ExpoConfig } from 'expo/config';

/**
 * Auto-incrementing versionCode based on minutes since 2025-01-01.
 * Matches the original build.gradle logic to ensure upgrades work
 * without uninstalling. Can be overridden via VERSION_CODE env var.
 */
function getVersionCode(): number {
  if (process.env.VERSION_CODE) {
    return parseInt(process.env.VERSION_CODE, 10);
  }
  const epoch = new Date('2025-01-01T00:00:00Z').getTime();
  return Math.floor((Date.now() - epoch) / 60000);
}

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Kodiq Academy',
  slug: 'kodiq-academy',
  owner: 'kodiq',
  version: '1.0.0',
  runtimeVersion: { policy: 'appVersion' },
  updates: {
    url: 'https://u.expo.dev/5741bfe7-8b41-4619-b7d0-7b5e5850cbdf',
  },
  extra: {
    eas: { projectId: '5741bfe7-8b41-4619-b7d0-7b5e5850cbdf' },
  },
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'kodiq',
  newArchEnabled: true,

  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#141416',
  },

  ios: {
    bundleIdentifier: 'ai.kodiq',
    buildNumber: String(getVersionCode()),
    supportsTablet: false,
    appleTeamId: process.env.APPLE_TEAM_ID,
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIViewControllerBasedStatusBarAppearance: false,
    },
    entitlements: {
      'aps-environment': 'production',
      'com.apple.security.application-groups': ['group.ai.kodiq'],
    },
  },

  android: {
    package: 'ai.kodiq',
    versionCode: getVersionCode(),
    googleServicesFile: './google-services.json',
    permissions: ['INTERNET', 'USE_BIOMETRIC', 'USE_FINGERPRINT'],
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon-foreground.png',
      backgroundColor: '#111114',
    },
    intentFilters: [
      {
        action: 'VIEW',
        data: [{ scheme: 'kodiq' }],
        category: ['DEFAULT', 'BROWSABLE'],
      },
    ],
  },

  plugins: [
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics',
    [
      '@sentry/react-native/expo',
      { organization: 'kodiq', project: 'kodiq-mobile' },
    ],
    '@react-native-google-signin/google-signin',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 35,
          minSdkVersion: 24,
          enableProguardInReleaseBuilds: true,
          kotlinVersion: '2.1.20',
        },
        ios: { deploymentTarget: '16.0', useFrameworks: 'static' },
      },
    ],
    './plugins/withAndroidNotificationChannels',
    './plugins/withAndroidStreakWidget',
    './plugins/withAndroidFcmDefaults',
    './plugins/withAndroidShortcuts',
    './plugins/withAndroidProguard',
    './plugins/withIosStreakWidgetModule',
    '@bacons/apple-targets',
  ],
});
