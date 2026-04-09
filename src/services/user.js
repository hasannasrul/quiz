import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    updateDoc,
    runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

function isOfflineFirestoreError(e) {
    const msg = (e?.message || '').toLowerCase();
    const code = (e?.code || '').toLowerCase();
    return msg.includes('client is offline') || code.includes('unavailable');
}

export async function ensureUserDoc(user) {
    if (!user) return;
    const ref = doc(db, 'Users', user.uid);
    try {
        const snap = await getDoc(ref);
        if (snap.exists()) return;

        const email = (user.email || '').toLowerCase();
        await setDoc(ref, {
            uid: user.uid,
            email,
            displayName: user.displayName || '',
            username: null,
            usernameLower: null,
            createdAt: serverTimestamp(),
            scores: {
                lifetime: 0,
                highScore: 0,
                lastScore: 0,
            },
            streaks: {
                daily: 0,
                lastDailyDate: null,
            },
            badges: [],
            isPremium: false,
        });
    } catch (e) {
        // If the client is offline, don't block app start.
        if (isOfflineFirestoreError(e)) return;
        throw e;
    }
}

export async function getUserDoc(uid) {
    const ref = doc(db, 'Users', uid);
    try {
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
    } catch (e) {
        if (isOfflineFirestoreError(e)) return null;
        throw e;
    }
}

export async function setPremium(uid, isPremium) {
    const ref = doc(db, 'Users', uid);
    await updateDoc(ref, { isPremium: !!isPremium });
}

function normalizeUsername(input) {
    const raw = (input || '').trim();
    const lower = raw.toLowerCase();
    return { raw, lower };
}

export function validateUsername(username) {
    const { raw } = normalizeUsername(username);
    // 3-15 chars, letters/numbers/underscore
    if (!raw) return 'Username is required';
    if (raw.length < 3) return 'Username must be at least 3 characters';
    if (raw.length > 15) return 'Username must be 15 characters or less';
    if (!/^[A-Za-z0-9_]+$/.test(raw)) return 'Use only letters, numbers, and _';
    return '';
}

// Atomically reserve a username and attach it to the user.
// Uses a dedicated collection for uniqueness: Usernames/{usernameLower} -> { uid, username, createdAt }
export async function setUsername(uid, username) {
    if (!uid) throw new Error('Missing uid');
    const validation = validateUsername(username);
    if (validation) throw new Error(validation);

    const { raw, lower } = normalizeUsername(username);
    const unameRef = doc(db, 'Usernames', lower);
    const userRef = doc(db, 'Users', uid);

    await runTransaction(db, async (tx) => {
        const unameSnap = await tx.get(unameRef);
        if (unameSnap.exists()) {
            const existingUid = unameSnap.data()?.uid;
            if (existingUid !== uid) {
                throw new Error('That username is taken');
            }
            // already reserved by this user
        } else {
            tx.set(unameRef, {
                uid,
                username: raw,
                createdAt: serverTimestamp(),
            });
        }
        tx.update(userRef, {
            username: raw,
            usernameLower: lower,
        });
    });
}

