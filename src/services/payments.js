import { ENV } from '../config/env';

// Client-side payments: keep keys in env; secrets must stay on server (Cloud Functions).
// This file intentionally keeps runtime safe for Expo Go by providing stubs.

export function getPaymentsProvider() {
    return (ENV.payments.provider || 'stripe').toLowerCase();
}

export function isUpiEnabled() {
    return !!ENV.payments.upiEnabled;
}

export function canUseStripe() {
    return getPaymentsProvider() === 'stripe' && !!ENV.payments.stripePublishableKey;
}

export function canUseRazorpay() {
    return getPaymentsProvider() === 'razorpay' && !!ENV.payments.razorpayKeyId;
}

// Subscription flow needs native modules (Stripe RN SDK / Razorpay SDK) + server endpoints.
// We keep a predictable surface so you can plug in later without changing screens.
export async function startSubscriptionCheckout() {
    if (canUseStripe()) {
        throw new Error(
            'Stripe checkout is not wired yet. Deploy Cloud Functions and add Stripe RN SDK in a custom dev client.'
        );
    }
    if (canUseRazorpay()) {
        throw new Error(
            'Razorpay checkout is not wired yet. Add Razorpay RN SDK and server verification.'
        );
    }
    throw new Error('Payments not configured. Set STRIPE_PROVIDER and keys in .env');
}
