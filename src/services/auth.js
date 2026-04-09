import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    signInWithCredential,
    linkWithCredential,
    onAuthStateChanged,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType, makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { firebaseAuth } from './firebase';
import { ENV } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

export function isGoogleAuthConfigured() {
    const { expoClientId, iosClientId, androidClientId, webClientId } = ENV.google;

    // If any client ID is provided, we can attempt Google auth.
    // Platform-specific IDs are recommended for standalone/dev-client builds, but Expo Go commonly uses Expo/Web IDs.
    const hasAny = !!expoClientId || !!webClientId || !!androidClientId || !!iosClientId;
    if (!hasAny) return false;

    // In Expo Go, Google auth commonly uses the Expo proxy redirect URI and a Web/Expo client id.
    const appOwnership = Constants.appOwnership; // 'expo' in Expo Go, 'standalone' in builds
    const execEnv = Constants.executionEnvironment; // 'storeClient' in Expo Go
    if (appOwnership === 'expo' || execEnv === 'storeClient') {
        return !!expoClientId || !!webClientId;
    }

    // For standalone/dev-client builds, prefer platform-specific IDs on device.
    if (Platform.OS === 'android') return !!androidClientId || !!expoClientId || !!webClientId;
    if (Platform.OS === 'ios') return !!iosClientId || !!expoClientId || !!webClientId;
    if (Platform.OS === 'web') return !!webClientId;
    return hasAny;
}

export function useGoogleAuthRequest() {
    const appOwnership = Constants.appOwnership;
    const execEnv = Constants.executionEnvironment;
    const isExpoGo = appOwnership === 'expo' || execEnv === 'storeClient';

    const hasPlatformIds = !!ENV.google.androidClientId || !!ENV.google.iosClientId;

    const shouldForceProxy = isExpoGo || !hasPlatformIds;

    if (shouldForceProxy) {
        // Use the Expo proxy redirect (https://auth.expo.io/...) and a Web/Expo OAuth client id.
        const clientId = ENV.google.expoClientId || ENV.google.webClientId || undefined;
        const owner = Constants?.expoConfig?.owner || 'anonymous';
        const slug = Constants?.expoConfig?.slug || 'history-quiz';
        const redirectUri = `https://auth.expo.io/@${owner}/${slug}`;

        console.log('[Google Auth] Using Expo proxy redirect:', redirectUri);
        console.log('[Google Auth] Client ID:', clientId);

        const [request, response, promptAsync] = Google.useAuthRequest(
            {
                clientId,
                responseType: ResponseType.IdToken,
                scopes: ['profile', 'email'],
                selectAccount: true,
                redirectUri,
            },
            { useProxy: true }
        );

        const promptWithProxy = (options) => {
            console.log('[Google Auth] Prompting with proxy, redirectUri:', request?.redirectUri);
            return promptAsync({ ...(options || {}), useProxy: true });
        };

        return { request, response, promptAsync: promptWithProxy };
    }

    // In dev-client/standalone builds, prefer platform-specific client IDs.
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
        {
            iosClientId: ENV.google.iosClientId || undefined,
            androidClientId: ENV.google.androidClientId || undefined,
            webClientId: ENV.google.webClientId || undefined,
            scopes: ['profile', 'email'],
            selectAccount: true,
        },
        { useProxy: Platform.OS === 'web' }
    );
    return { request, response, promptAsync };
}

export async function signInOrLinkWithGoogleIdToken(idToken) {
    const credential = GoogleAuthProvider.credential(idToken);
    const current = firebaseAuth.currentUser;
    if (current?.isAnonymous) {
        // Convert guest -> Google while keeping the same UID/data
        return linkWithCredential(current, credential);
    }
    return signInWithCredential(firebaseAuth, credential);
}

export async function signInGuest() {
    return signInAnonymously(firebaseAuth);
}

export async function signUpEmail(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signInEmail(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    return signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function signOutUser() {
    return signOut(firebaseAuth);
}

export function subscribeAuth(callback) {
    return onAuthStateChanged(firebaseAuth, callback);
}
