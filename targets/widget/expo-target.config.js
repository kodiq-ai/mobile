/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: 'widget',
  name: 'StreakWidget',
  bundleIdentifier: 'ai.kodiq.StreakWidget',
  deploymentTarget: '16.0',
  entitlements: {
    'com.apple.security.application-groups': ['group.ai.kodiq'],
  },
  frameworks: ['WidgetKit', 'SwiftUI'],
};
