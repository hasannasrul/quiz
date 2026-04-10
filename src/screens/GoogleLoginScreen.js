import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import {
    isExpoGoRuntime,
    isGoogleAuthConfigured,
    signInOrLinkWithGoogleIdToken,
    useGoogleAuthRequest,
} from '../services/auth';
import { ENV } from '../config/env';

export default function GoogleLoginScreen({ navigation }) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const configured = isGoogleAuthConfigured();
    const expoGoRuntime = isExpoGoRuntime();

    // IMPORTANT: only mount the Google hook if configured, otherwise it throws on Android.
    const hook = configured && !expoGoRuntime ? useGoogleAuthRequest() : null;
    const request = hook?.request;
    const response = hook?.response;
    const promptAsync = hook?.promptAsync;
    const redirectUri = hook?.redirectUri;
    const useProxy = !!hook?.useProxy;
    const isExpoGo = !!hook?.isExpoGo;
    const googleEnabled = useMemo(() => !!request, [request]);
    const appOwnership = Constants.appOwnership;
    const execEnv = Constants.executionEnvironment;
    const runtimeExpoGo = appOwnership === 'expo' || execEnv === 'storeClient';

    const debugClientId = ENV.google.expoClientId || ENV.google.webClientId || ENV.google.androidClientId || ENV.google.iosClientId;
    const debugRedirectUri = request?.redirectUri || redirectUri || hook?.request?.redirectUri;
    const invalidGoogleSetup = configured && !debugClientId;

    useEffect(() => {
        (async () => {
            if (!configured) return;
            if (!response) return;

            console.log('Google auth response:', response);

            if (response.type === 'error') {
                const msg = response.error?.message || response.params?.error_description || response.params?.error || 'Unknown error';
                setError(`Auth error: ${msg}`);
                return;
            }

            if (response.type === 'cancel') {
                setError('Sign-in was cancelled.');
                return;
            }

            if (response.type !== 'success') return;

            const idToken = response.authentication?.idToken || response.params?.id_token;
            console.log('Extracted idToken:', idToken ? 'present' : 'missing');

            if (!idToken) {
                setError('Google sign-in succeeded but no idToken was returned. Check Google client IDs.');
                return;
            }
            try {
                setBusy(true);
                setError('');
                await signInOrLinkWithGoogleIdToken(idToken);
            } catch (e) {
                console.error('Firebase sign-in error:', e);
                setError(e?.message || 'Google sign-in failed');
            } finally {
                setBusy(false);
            }
        })();
    }, [configured, response]);

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Continue with Google</Text>
            <Text style={styles.sub}>
                Use Google to sync progress and unlock premium.
            </Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            {!configured ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Google Sign-In not configured</Text>
                    <Text style={styles.cardBody}>
                        If you are using Expo Go, set `GOOGLE_EXPO_CLIENT_ID` (or `GOOGLE_WEB_CLIENT_ID`) in your .env and restart Expo.
                        {'\n'}
                        If you are using a dev client / standalone build, set `GOOGLE_ANDROID_CLIENT_ID` (Android) or `GOOGLE_IOS_CLIENT_ID` (iOS).
                        {'\n'}
                        Client IDs must end with `.apps.googleusercontent.com`.
                    </Text>
                </View>
            ) : null}
            {expoGoRuntime ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Google Sign-In needs a development build</Text>
                    <Text style={styles.cardBody}>
                        The current Expo Go runtime keeps falling back to `exp://` redirects, which Google rejects.
                        {'\n'}
                        For production-grade mobile Google auth, we should move this app to a dev build and wire the native Google Sign-In SDK.
                    </Text>
                </View>
            ) : null}
            {invalidGoogleSetup ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>OAuth setup required</Text>
                    <Text style={styles.cardBody}>
                        Google OAuth client ID is missing.
                        {'\n'}
                        Add this redirect URI to Google Cloud OAuth credentials:
                        {'\n'}
                        {debugRedirectUri || '(redirect uri unavailable)'}
                    </Text>
                </View>
            ) : null}

            <PrimaryButton
                label={busy ? 'Please wait…' : 'Sign in with Google'}
                onPress={() => (promptAsync ? promptAsync() : null)}
                disabled={busy || !configured || !googleEnabled || invalidGoogleSetup || expoGoRuntime}
            />

            {configured && !googleEnabled ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Still loading Google…</Text>
                    <Text style={styles.cardBody}>If this never enables, restart Expo with `npx expo start -c`.</Text>
                </View>
            ) : null}

            {configured && !!debugRedirectUri && !expoGoRuntime ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Google OAuth debug</Text>
                    <Text style={styles.cardBody}>Client ID: {debugClientId || '(missing)'}</Text>
                    <Text style={styles.cardBody}>Redirect URI: {debugRedirectUri}</Text>
                    <Text style={styles.cardBody}>Use Proxy: {String(useProxy)}</Text>
                    <Text style={styles.cardBody}>Expo Go Runtime: {String(isExpoGo || runtimeExpoGo)}</Text>
                    <Text style={styles.cardBody}>
                        If you see “redirect_uri_mismatch”, add the Redirect URI above in Google Cloud Console → Credentials → your OAuth client as an
                        "Authorized redirect URI".
                        {'\n'}
                        Do NOT add exp://... as an origin (Google will reject it). Use the https://auth.expo.io/... value when shown.
                    </Text>
                </View>
            ) : null}

            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton label="Back" onPress={() => navigation.goBack()} disabled={busy} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    h1: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: '900',
    },
    sub: {
        color: theme.colors.muted,
        marginTop: 8,
        marginBottom: theme.spacing.lg,
    },
    error: {
        color: theme.colors.danger,
        marginBottom: theme.spacing.md,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        marginBottom: 6,
    },
    cardBody: {
        color: theme.colors.muted,
        lineHeight: 18,
    },
});
