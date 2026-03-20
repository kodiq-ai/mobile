const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Copies StreakWidgetModule.swift and StreakWidgetBridge.m into the
 * generated iOS project. These files provide the JS-to-native bridge
 * for calling updateStreak() from React Native.
 */
const withIosStreakWidgetModule = config => {
  return withDangerousMod(config, [
    'ios',
    async mod => {
      const projectRoot = mod.modRequest.projectRoot;
      const iosProjectDir = path.join(
        mod.modRequest.platformProjectRoot,
        'KodiqAcademy',
      );

      fs.mkdirSync(iosProjectDir, { recursive: true });

      const filesToCopy = ['StreakWidgetModule.swift', 'StreakWidgetBridge.m'];
      for (const file of filesToCopy) {
        const src = path.join(projectRoot, 'targets/widget', file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(iosProjectDir, file));
        }
      }

      return mod;
    },
  ]);
};

module.exports = withIosStreakWidgetModule;
