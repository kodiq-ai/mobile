const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Copies custom ProGuard rules into the generated Android project.
 * Rules are appended to the existing proguard-rules.pro file.
 */
const withAndroidProguard = config => {
  return withDangerousMod(config, [
    'android',
    async mod => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformRoot = mod.modRequest.platformProjectRoot;

      const src = path.join(projectRoot, 'plugins/proguard-rules.pro');
      const dst = path.join(platformRoot, 'app/proguard-rules.pro');

      if (fs.existsSync(src)) {
        const customRules = fs.readFileSync(src, 'utf-8');

        if (fs.existsSync(dst)) {
          const existing = fs.readFileSync(dst, 'utf-8');
          if (!existing.includes('Kodiq Mobile')) {
            fs.appendFileSync(dst, `\n${customRules}`);
          }
        } else {
          fs.copyFileSync(src, dst);
        }
      }

      return mod;
    },
  ]);
};

module.exports = withAndroidProguard;
