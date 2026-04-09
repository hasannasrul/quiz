import { initializeApp, getApps } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
    getAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

function assertFirebaseConfig(config) {
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'];
    const missing = required.filter((k) => !config[k]);
    if (missing.length) {
        throw new Error(
            `Missing Firebase env vars: ${missing.join(', ')}. Fill .env and restart Expo.`
        );
    }
}

assertFirebaseConfig(ENV.firebase);

const app = getApps().length ? getApps()[0] : initializeApp(ENV.firebase);

// In Expo/React Native we need explicit persistence
let auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
    });
} catch (e) {
    // initializeAuth throws if called twice
    auth = getAuth(app);
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, ENV.functionsRegion);
