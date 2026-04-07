import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bulgarche.app',
  appName: 'Bulgarche',
  webDir: 'mobile-public',
  bundledWebRuntime: false,
  cordova: {
    preferences: {
      SplashScreen: 'screen',
      SplashScreenDelay: '3000'
    }
  }
};

export default config;
