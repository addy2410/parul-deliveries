
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.campusgrub.mobile',
  appName: 'CampusGrub',
  webDir: 'dist',
  server: {
    // This is the production URL - the app will use this when built
    url: 'https://46155acd-6845-4a7c-a990-1818e188551e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystorePassword: null,
      keystoreAlias: null,
      keystoreAliasPassword: null,
      signingType: "apksigner"
    }
  },
  ios: {
    contentInset: "always",
    allowsLinkPreview: true,
    scrollEnabled: true,
    useOnlineAssets: true
  },
};

export default config;
