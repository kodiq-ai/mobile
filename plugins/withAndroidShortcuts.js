const {
  withAndroidManifest,
  withDangerousMod,
  withStringsXml,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Adds Android App Shortcuts (long-press menu) to the generated project:
 * - Copies shortcuts.xml into res/xml/
 * - Adds <meta-data android:name="android.app.shortcuts"> to MainActivity
 * - Adds shortcut string resources
 */
const withAndroidShortcuts = config => {
  // Step 1: Copy shortcuts.xml
  config = withDangerousMod(config, [
    'android',
    async mod => {
      const projectRoot = mod.modRequest.projectRoot;
      const resDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/res',
      );

      const xmlDir = path.join(resDir, 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });

      const src = path.join(projectRoot, 'plugins/shortcuts.xml');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(xmlDir, 'shortcuts.xml'));
      }

      return mod;
    },
  ]);

  // Step 2: Add shortcut strings
  config = withStringsXml(config, mod => {
    const strings = mod.modResults;
    if (!strings.resources.string) {
      strings.resources.string = [];
    }

    const shortcutStrings = [
      { name: 'shortcut_review', value: 'Повторение' },
      { name: 'shortcut_review_long', value: 'Интервальное повторение' },
      { name: 'shortcut_dashboard', value: 'Прогресс' },
      { name: 'shortcut_dashboard_long', value: 'Мой прогресс' },
      { name: 'shortcut_search', value: 'Поиск' },
      { name: 'shortcut_search_long', value: 'Поиск курсов' },
    ];

    for (const { name, value } of shortcutStrings) {
      const exists = strings.resources.string.some(s => s.$?.name === name);
      if (!exists) {
        strings.resources.string.push({
          $: { name },
          _: value,
        });
      }
    }

    return mod;
  });

  // Step 3: Add shortcuts meta-data to MainActivity
  config = withAndroidManifest(config, mod => {
    const mainApp = mod.modResults.manifest.application?.[0];
    if (!mainApp?.activity) return mod;

    const mainActivity = mainApp.activity.find(
      a => a.$?.['android:name'] === '.MainActivity',
    );
    if (!mainActivity) return mod;

    if (!mainActivity['meta-data']) {
      mainActivity['meta-data'] = [];
    }

    const exists = mainActivity['meta-data'].some(
      m => m.$?.['android:name'] === 'android.app.shortcuts',
    );

    if (!exists) {
      mainActivity['meta-data'].push({
        $: {
          'android:name': 'android.app.shortcuts',
          'android:resource': '@xml/shortcuts',
        },
      });
    }

    return mod;
  });

  return config;
};

module.exports = withAndroidShortcuts;
