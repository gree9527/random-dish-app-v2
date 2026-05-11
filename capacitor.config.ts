import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.randomdish',
  appName: '今天吃什么',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
