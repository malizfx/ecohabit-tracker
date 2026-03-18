import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecohabit.tracker',
  appName: 'ecohabit tracker',
  webDir: 'dist'
  server: {
    url: 'http://192.168.88.180:3000', 
    cleartext: true
  }
};

export default config;
