/**
 * Registers HealthConnectPermissionDelegate on MainActivity.onCreate.
 * Required by react-native-health-connect — without it, requestPermission crashes:
 * `lateinit property requestPermission has not been initialized`.
 *
 * @param {import('expo/config').ExpoConfig} config
 * @returns {import('expo/config').ExpoConfig}
 */
function withHealthConnectPermissionDelegate(config) {
  // Use expo/config-plugins (not @expo/config-plugins) so pnpm + Xcode
  // EXConstants scripts can resolve the package via the expo dependency.
  const { withMainActivity } = require('expo/config-plugins');

  return withMainActivity(config, (cfg) => {
    if (cfg.modResults.language !== 'kt') {
      return cfg;
    }

    let contents = cfg.modResults.contents;
    if (contents.includes('HealthConnectPermissionDelegate')) {
      return cfg;
    }

    if (!contents.includes('import android.os.Bundle')) {
      contents = contents.replace(
        /package [^\n]+\n/,
        (pkg) => `${pkg}\nimport android.os.Bundle\n`
      );
    }

    contents = contents.replace(
      /import expo\.modules\.ReactActivityDelegateWrapper\n/,
      'import expo.modules.ReactActivityDelegateWrapper\nimport dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate\n'
    );

    if (!contents.includes('HealthConnectPermissionDelegate')) {
      // Fallback if import path above didn't match.
      contents = contents.replace(
        /import com\.facebook\.react\.defaults\.DefaultReactActivityDelegate\n/,
        'import com.facebook.react.defaults.DefaultReactActivityDelegate\nimport dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate\n'
      );
    }

    contents = contents.replace(
      /(super\.onCreate\([^\)]*\))/,
      '$1\n    // react-native-health-connect: activity result contract for permission dialogs\n    HealthConnectPermissionDelegate.setPermissionDelegate(this)'
    );

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withHealthConnectPermissionDelegate;
