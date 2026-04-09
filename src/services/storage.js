import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadQuestionImage({ uid, localUri }) {
    if (!uid) throw new Error('Missing uid');
    if (!localUri) throw new Error('Missing localUri');

    const response = await fetch(localUri);
    const blob = await response.blob();
    const path = `question-images/${uid}/${Date.now()}.jpg`;
    const r = ref(storage, path);
    await uploadBytes(r, blob, { contentType: 'image/jpeg' });
    return getDownloadURL(r);
}
