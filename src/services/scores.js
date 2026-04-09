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

export async function submitScore({ uid, score, category = 'History', subCategory = 'ancient' }) {
    if (!uid) throw new Error('Missing uid');
    const userRef = doc(db, 'Users', uid);
    const userSnap = await getDoc(userRef);
    const prevHighScore = userSnap.exists() ? Number(userSnap.data()?.scores?.highScore || 0) : 0;
    const username = userSnap.data()?.username || '';

    await addDoc(collection(db, 'Scores'), {
        userId: uid,
        username,
        score,
        category,
        subCategory,
        date: serverTimestamp(),
    });

    await updateDoc(userRef, {
        'scores.lifetime': increment(score),
        'scores.lastScore': score,
        'scores.highScore': Math.max(prevHighScore, score),
    });
}
