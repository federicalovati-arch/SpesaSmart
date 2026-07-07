import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spesasmart.app',
  appName: 'SpesaSmart',
  webDir: '.next',
    server: {
    url: 'https://project-cyan-ten-35.vercel.app/', 
    cleartext: true
  }
};

export default config;
