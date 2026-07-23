/**
 * Wires Play upload-keystore release signing when
 * `credentials/android/keystore.properties` exists (gitignored).
 *
 * Expected properties:
 *   storePassword, keyPassword, keyAlias, storeFile (absolute path)
 *
 * @param {import('expo/config').ExpoConfig} config
 * @returns {import('expo/config').ExpoConfig}
 */
function withAndroidReleaseSigning(config) {
  const { withAppBuildGradle } = require('expo/config-plugins');

  return withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    if (contents.includes('coachWattsUploadKeystoreProperties')) {
      return cfg;
    }

    const propsBlock = `
    def coachWattsUploadKeystoreProperties = new Properties()
    def coachWattsUploadKeystorePropertiesFile = rootProject.file("../credentials/android/keystore.properties")
    if (coachWattsUploadKeystorePropertiesFile.exists()) {
        coachWattsUploadKeystoreProperties.load(new FileInputStream(coachWattsUploadKeystorePropertiesFile))
    }
`;

    if (!contents.includes('signingConfigs {')) {
      throw new Error('withAndroidReleaseSigning: signingConfigs block not found in app/build.gradle');
    }

    contents = contents.replace(
      /android\s*\{/,
      (match) => `${match}${propsBlock}`
    );

    contents = contents.replace(
      /signingConfigs\s*\{\s*debug\s*\{[^}]+\}/,
      (match) => `${match}
        release {
            if (coachWattsUploadKeystorePropertiesFile.exists()) {
                keyAlias coachWattsUploadKeystoreProperties['keyAlias']
                keyPassword coachWattsUploadKeystoreProperties['keyPassword']
                storeFile file(coachWattsUploadKeystoreProperties['storeFile'])
                storePassword coachWattsUploadKeystoreProperties['storePassword']
            }
        }`
    );

    contents = contents.replace(
      /release\s*\{\s*\/\/ Caution![\s\S]*?signingConfig signingConfigs\.debug/,
      `release {
            // Prefer Play upload keystore when credentials/android/keystore.properties exists.
            if (coachWattsUploadKeystorePropertiesFile.exists()) {
                signingConfig signingConfigs.release
            } else {
                signingConfig signingConfigs.debug
            }`
    );

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withAndroidReleaseSigning;
