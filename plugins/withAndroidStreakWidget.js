const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
  withStringsXml,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = 'ai.kodiq';

/**
 * Adds Android StreakWidget to the generated project:
 * - Copies .kt source files into the app package directory
 * - Copies XML layouts, drawables, and widget config into res/
 * - Registers <receiver> in AndroidManifest.xml
 * - Registers StreakWidgetPackage in MainApplication.kt
 * - Adds widget_description string resource
 */
const withAndroidStreakWidget = config => {
  // Step 1: Copy Kotlin source files and XML resources
  config = withDangerousMod(config, [
    'android',
    async mod => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformRoot = mod.modRequest.platformProjectRoot;
      const srcDir = path.join(projectRoot, 'plugins/android-widget');

      // Copy .kt files to package directory
      const kotlinDst = path.join(
        platformRoot,
        'app/src/main/java',
        ...PACKAGE_NAME.split('.'),
      );
      fs.mkdirSync(kotlinDst, { recursive: true });

      for (const file of [
        'StreakWidgetModule.kt',
        'StreakWidgetPackage.kt',
        'StreakWidgetProvider.kt',
      ]) {
        const src = path.join(srcDir, 'src', file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(kotlinDst, file));
        }
      }

      // Copy XML resources
      const resDir = path.join(platformRoot, 'app/src/main/res');
      const resMappings = [
        ['res/layout/widget_streak.xml', 'layout/widget_streak.xml'],
        [
          'res/drawable/widget_background.xml',
          'drawable/widget_background.xml',
        ],
        ['res/xml/streak_widget_info.xml', 'xml/streak_widget_info.xml'],
      ];

      for (const [src, dst] of resMappings) {
        const srcPath = path.join(srcDir, src);
        const dstPath = path.join(resDir, dst);
        if (fs.existsSync(srcPath)) {
          fs.mkdirSync(path.dirname(dstPath), { recursive: true });
          fs.copyFileSync(srcPath, dstPath);
        }
      }

      return mod;
    },
  ]);

  // Step 2: Add widget_description string
  config = withStringsXml(config, mod => {
    const strings = mod.modResults;
    const exists = strings.resources.string?.some(
      s => s.$?.name === 'widget_description',
    );
    if (!exists) {
      if (!strings.resources.string) {
        strings.resources.string = [];
      }
      strings.resources.string.push({
        $: { name: 'widget_description' },
        _: 'Streak и ежедневный прогресс',
      });
    }
    return mod;
  });

  // Step 3: Register StreakWidgetProvider receiver in AndroidManifest.xml
  config = withAndroidManifest(config, mod => {
    const mainApp = mod.modResults.manifest.application?.[0];
    if (!mainApp) return mod;

    if (!mainApp.receiver) {
      mainApp.receiver = [];
    }

    const receiverExists = mainApp.receiver.some(
      r => r.$?.['android:name'] === '.StreakWidgetProvider',
    );

    if (!receiverExists) {
      mainApp.receiver.push({
        $: {
          'android:name': '.StreakWidgetProvider',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/streak_widget_info',
            },
          },
        ],
      });
    }

    return mod;
  });

  // Step 4: Register StreakWidgetPackage in MainApplication.kt
  config = withMainApplication(config, mod => {
    const contents = mod.modResults.contents;

    if (!contents.includes('StreakWidgetPackage')) {
      let updated = contents.replace(
        'import com.facebook.react.PackageList',
        `import com.facebook.react.PackageList
import ${PACKAGE_NAME}.StreakWidgetPackage`,
      );

      updated = updated.replace(
        'PackageList(this).packages',
        `PackageList(this).packages.apply {
          add(StreakWidgetPackage())
        }`,
      );

      mod.modResults.contents = updated;
    }

    return mod;
  });

  return config;
};

module.exports = withAndroidStreakWidget;
