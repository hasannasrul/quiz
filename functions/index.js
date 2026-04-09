const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();

function getStripe() {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Missing STRIPE_SECRET_KEY in functions env.'
        );
    }
    return new Stripe(secret, { apiVersion: '2024-06-20' });
}

async function requireAdmin(context) {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
    }
    const uid = context.auth.uid;
    const snap = await admin.firestore().doc(`Users/${uid}`).get();
    if (!snap.exists || !snap.data()?.roles?.admin) {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    return uid;
}

// Minimal: mark a user premium (admin tool).
exports.adminSetPremium = functions.https.onCall(async (data, context) => {
    await requireAdmin(context);
    const { uid, isPremium } = data || {};
    if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid');
    await admin.firestore().doc(`Users/${uid}`).update({ isPremium: !!isPremium });
    return { ok: true };
});

// Placeholder callable to create a Stripe customer for the current user.
exports.createStripeCustomer = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in required');
    const uid = context.auth.uid;
    const stripe = getStripe();
    const userSnap = await admin.firestore().doc(`Users/${uid}`).get();
    const email = userSnap.data()?.email || undefined;

    const customer = await stripe.customers.create({
        email,
        metadata: { uid },
    });

    await admin.firestore().doc(`Users/${uid}`).update({
        stripeCustomerId: customer.id,
    });

    return { customerId: customer.id };
});
