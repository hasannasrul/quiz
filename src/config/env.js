import Constants from 'expo-constants';

const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};

function read(key, fallback = '') {
    const fromExtra = extra[key];
    const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
    return (fromExtra ?? fromProcess ?? fallback);
}

export const ENV = {
    firebase: {
        apiKey: read('FIREBASE_API_KEY'),
        authDomain: read('FIREBASE_AUTH_DOMAIN'),
        projectId: read('FIREBASE_PROJECT_ID'),
        storageBucket: read('FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: read('FIREBASE_MESSAGING_SENDER_ID'),
        appId: read('FIREBASE_APP_ID'),
    },
    google: {
        expoClientId: read('GOOGLE_EXPO_CLIENT_ID'),
        iosClientId: read('GOOGLE_IOS_CLIENT_ID'),
        androidClientId: read('GOOGLE_ANDROID_CLIENT_ID'),
        webClientId: read('GOOGLE_WEB_CLIENT_ID'),
    },
    ads: {
        enabled: read('ADS_ENABLED', '0') === '1',
        appId: read('ADMOB_APP_ID'),
        bannerId: read('ADMOB_BANNER_ID'),
        interstitialId: read('ADMOB_INTERSTITIAL_ID'),
    },
    payments: {
        stripePublishableKey: read('STRIPE_PUBLISHABLE_KEY'),
        provider: read('STRIPE_PROVIDER', 'stripe'),
        upiEnabled: read('PAYMENTS_UPI_ENABLED', '0') === '1',
        razorpayKeyId: read('RAZORPAY_KEY_ID'),
    },
    functionsRegion: read('FUNCTIONS_REGION', 'us-central1'),
};
