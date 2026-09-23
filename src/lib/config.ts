import { Platform } from 'react-native';

// All values come from EXPO_PUBLIC_* env vars (see .env.example). They are
// baked into the app bundle, so never put secrets here — the Claude API key
// lives only on the server.
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

export const REVENUECAT_KEY =
  Platform.select({
    ios: process.env.EXPO_PUBLIC_RC_IOS_KEY,
    android: process.env.EXPO_PUBLIC_RC_ANDROID_KEY,
  }) ?? '';

export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? 'https://www.bcmediaessex.co.uk/privacy';
export const TERMS_URL =
  process.env.EXPO_PUBLIC_TERMS_URL ?? 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? 'hello@bcmediaessex.co.uk';

/** Entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = 'pro';

/** Without a backend URL the app runs in demo mode with canned responses. */
export const DEMO_MODE = API_URL === '';

export const PLAN_LIMITS = {
  free: { agents: 2, runsPerMonth: 20 },
  pro: { agents: Infinity, runsPerMonth: 300 },
} as const;
