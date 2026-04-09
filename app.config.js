import 'dotenv/config';

export default ({ config }) => ({
    ...config,
    name: 'History Quest',
    slug: config.slug || 'history-quiz',
    extra: {
        ...config.extra,
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,

        GOOGLE_EXPO_CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID,
        GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
        GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
        GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,

        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        STRIPE_PROVIDER: process.env.STRIPE_PROVIDER || 'stripe',
        PAYMENTS_UPI_ENABLED: process.env.PAYMENTS_UPI_ENABLED || '0',
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,

        ADMOB_APP_ID: process.env.ADMOB_APP_ID,
        ADMOB_BANNER_ID: process.env.ADMOB_BANNER_ID,
        ADMOB_INTERSTITIAL_ID: process.env.ADMOB_INTERSTITIAL_ID,
        ADS_ENABLED: process.env.ADS_ENABLED || '0',
        FUNCTIONS_REGION: process.env.FUNCTIONS_REGION || 'us-central1',
    },
});
