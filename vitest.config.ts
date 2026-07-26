import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __DEV__: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-constants': path.resolve(__dirname, 'src/test/mocks/expo-constants.ts'),
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/test/mocks/async-storage.ts',
      ),
      '@': path.resolve(__dirname, '.'),
    },
  },
});
