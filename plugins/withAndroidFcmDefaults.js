const {
  withAndroidManifest,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Adds FCM default notification icon, color, and channel to AndroidManifest.xml.
 * Copies ic_notification.png and notification_accent color into res/.
 */
const withAndroidFcmDefaults = config => {
  // Step 1: Add <meta-data> to AndroidManifest.xml
  config = withAndroidManifest(config, mod => {
    const mainApp = mod.modResults.manifest.application?.[0];
    if (!mainApp) return mod;

    if (!mainApp['meta-data']) {
      mainApp['meta-data'] = [];
    }

    const metaEntries = [
      {
        name: 'com.google.firebase.messaging.default_notification_icon',
        resource: '@drawable/ic_notification',
      },
      {
        name: 'com.google.firebase.messaging.default_notification_color',
        resource: '@color/notification_accent',
      },
      {
        name: 'com.google.firebase.messaging.default_notification_channel_id',
        resource: 'social',
      },
    ];

    // Ensure tools namespace is declared
    if (!mod.modResults.manifest.$?.['xmlns:tools']) {
      mod.modResults.manifest.$['xmlns:tools'] =
        'http://schemas.android.com/tools';
    }

    for (const entry of metaEntries) {
      // Remove existing entries from Firebase or other libs (we override)
      mainApp['meta-data'] = mainApp['meta-data'].filter(
        m => m.$?.['android:name'] !== entry.name,
      );

      const isResource = entry.resource.startsWith('@');
      mainApp['meta-data'].push({
        $: {
          'android:name': entry.name,
          ...(isResource
            ? {
                'android:resource': entry.resource,
                'tools:replace': 'android:resource',
              }
            : {
                'android:value': entry.resource,
                'tools:replace': 'android:value',
              }),
        },
      });
    }

    return mod;
  });

  // Step 2: Copy notification icon and colors
  config = withDangerousMod(config, [
    'android',
    async mod => {
      const projectRoot = mod.modRequest.projectRoot;
      const resDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/res',
      );

      // Copy ic_notification.png to drawable-hdpi
      const drawableDir = path.join(resDir, 'drawable-hdpi');
      fs.mkdirSync(drawableDir, { recursive: true });
      const srcIcon = path.join(projectRoot, 'assets/ic_notification.png');
      if (fs.existsSync(srcIcon)) {
        fs.copyFileSync(srcIcon, path.join(drawableDir, 'ic_notification.png'));
      }

      // Ensure colors.xml has notification_accent
      const valuesDir = path.join(resDir, 'values');
      fs.mkdirSync(valuesDir, { recursive: true });
      const colorsPath = path.join(valuesDir, 'colors.xml');
      if (fs.existsSync(colorsPath)) {
        let colors = fs.readFileSync(colorsPath, 'utf-8');
        if (!colors.includes('notification_accent')) {
          colors = colors.replace(
            '</resources>',
            '    <color name="notification_accent">#C4A882</color>\n</resources>',
          );
          fs.writeFileSync(colorsPath, colors);
        }
      } else {
        fs.writeFileSync(
          colorsPath,
          `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="notification_accent">#C4A882</color>
</resources>
`,
        );
      }

      return mod;
    },
  ]);

  return config;
};

module.exports = withAndroidFcmDefaults;
