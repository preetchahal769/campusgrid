import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sikshatantar.campusgrid',
  appName: 'Siksha Tantar',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#0A4EA6"
    }
  },
  server: {
    url: 'http://192.168.0.191:3000',
    cleartext: true
  }
};

export default config;
