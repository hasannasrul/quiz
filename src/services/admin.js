import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function isAdmin(uid) {
    if (!uid) return false;
    const ref = doc(db, 'Users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data();
    return !!data?.roles?.admin;
}
