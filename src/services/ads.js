import { ENV } from '../config/env';

// NOTE: AdMob in React Native typically requires a custom dev client / EAS build.
// This module provides a safe abstraction so the app runs even when ads are disabled.

export function areAdsEnabled() {
    return !!ENV.ads.enabled && !!ENV.ads.bannerId;
}

export function getBannerUnitId() {
    return ENV.ads.bannerId || '';
}

export async function maybeShowInterstitial() {
    // Stub: integrate a real AdMob SDK in a custom dev client.
    // Keep this no-op so Expo Go runs.
    return;
}
