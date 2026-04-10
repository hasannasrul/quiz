import {
    addDoc,
    collection,
    doc,
    getDoc,
    increment,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export async function submitScore({ uid, score, category = 'History', subCategory = 'ancient', mode = 'category' }) {
    if (!uid) throw new Error('Missing uid');
    const userRef = doc(db, 'Users', uid);
    const userSnap = await getDoc(userRef);
    const prevHighScore = userSnap.exists() ? Number(userSnap.data()?.scores?.highScore || 0) : 0;
    const username = userSnap.data()?.username || '';
    const prevDaily = Number(userSnap.data()?.streaks?.daily || 0);
    const prevLastDailyDate = userSnap.data()?.streaks?.lastDailyDate || null;
    const today = new Date().toISOString().slice(0, 10);
    const streakUpdate =
        mode === 'daily' && prevLastDailyDate !== today
            ? {
                'streaks.daily': prevDaily + 1,
                'streaks.lastDailyDate': today,
            }
            : {};

    await addDoc(collection(db, 'Scores'), {
        userId: uid,
        username,
        score,
        category,
        subCategory,
        mode,
        date: serverTimestamp(),
    });

    await updateDoc(userRef, {
        'scores.lifetime': increment(score),
        'scores.lastScore': score,
        'scores.highScore': Math.max(prevHighScore, score),
        ...streakUpdate,
    });
}
