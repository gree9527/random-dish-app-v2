import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.randomdish',
  appName: '猪猪饲养员',
  webDir: 'dist',
  appVersion: '1.0.1',
  appBuildVersion: 2,
  server: {
    androidScheme: 'https',
  },
};

export default config;
