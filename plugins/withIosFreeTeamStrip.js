/**
 * Safety net for IOS_FREE_TEAM builds: remove paid-capability entitlements
 * that a free Personal Team provisioning profile cannot include.
 *
 * @param {import('expo/config').ExpoConfig} config
 * @returns {import('expo/config').ExpoConfig}
 */
function withIosFreeTeamStrip(config) {
  // Lazy require so config evaluation stays light when the flag is off.
  const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins');

  const entitlementKeys = [
    'aps-environment',
    'com.apple.developer.associated-domains',
    'com.apple.developer.healthkit',
    'com.apple.developer.healthkit.access',
    'com.apple.developer.healthkit.background-delivery',
    'com.apple.security.application-groups',
  ];

  config = withEntitlementsPlist(config, (cfg) => {
    for (const key of entitlementKeys) {
      delete cfg.modResults[key];
    }
    return cfg;
  });

  config = withInfoPlist(config, (cfg) => {
    const modes = cfg.modResults.UIBackgroundModes;
    if (Array.isArray(modes)) {
      cfg.modResults.UIBackgroundModes = modes.filter((m) => m !== 'remote-notification');
      if (cfg.modResults.UIBackgroundModes.length === 0) {
        delete cfg.modResults.UIBackgroundModes;
      }
    }
    return cfg;
  });

  return config;
}

module.exports = withIosFreeTeamStrip;
