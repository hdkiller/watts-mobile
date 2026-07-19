module.exports = function (api) {
  // Bust Babel's config cache when expo-widgets appears/disappears so
  // babel-preset-expo's widgets plugin (stringifies `'widget'` components)
  // is enabled after install without a mystery stale transform.
  api.cache.using(() => {
    try {
      return require.resolve('expo-widgets/package.json');
    } catch {
      return 'no-expo-widgets';
    }
  });

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
