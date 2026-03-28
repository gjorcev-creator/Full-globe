import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mk.mfa.geolens',
  appName: 'GeoLens Globe',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
