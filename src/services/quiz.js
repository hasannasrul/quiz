import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import shuffle from 'lodash.shuffle';
import { db } from './firebase';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { getCategoryById } from '../config/categories';

const CACHE_KEY = 'hq:last_questions_v1';

function isOfflineFirestoreError(e) {
    const msg = (e?.message || '').toLowerCase();
    const code = (e?.code || '').toLowerCase();
    return msg.includes('client is offline') || code.includes('unavailable');
}

function sanitizeQuestion(docSnap) {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        text: data.text,
        options: data.options || [],
        correctIndex: data.correctIndex,
        category: data.category || 'History',
        categoryId: data.categoryId || 'history',
        subCategory: data.subCategory || 'ancient',
        difficulty: data.difficulty || 'easy',
        explanation: data.explanation || '',
        imageUrl: data.imageUrl || '',
        roast: data.roast || 'Oof. The historians are disappointed.',
    };
}

function pickLocalQuestions({ categoryId, subCategoryId, count }) {
    const localPool = (SAMPLE_QUESTIONS || []).filter((question) => {
        if (categoryId && question.categoryId !== categoryId) return false;
        if (subCategoryId && question.subCategory !== subCategoryId) return false;
        return true;
    });

    const widenedPool = localPool.length
        ? localPool
        : (SAMPLE_QUESTIONS || []).filter((question) => !categoryId || question.categoryId === categoryId);

    return shuffle(widenedPool).slice(0, count);
}

export async function fetchQuestions({ categoryId, subCategoryId, count = 10 }) {
    const category = categoryId ? getCategoryById(categoryId) : null;
    try {
        const base = collection(db, 'Questions');
        const clauses = [];
        if (category?.firestoreName) clauses.push(where('category', '==', category.firestoreName));
        if (subCategoryId) clauses.push(where('subCategory', '==', subCategoryId));
        const q = query(base, ...clauses, limit(Math.max(count * 3, count)));
        const snap = await getDocs(q);
        const questions = snap.docs.map(sanitizeQuestion);
        const picked = shuffle(questions).slice(0, count);
        if (picked.length) {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), picked }));
            return picked;
        }
        throw new Error('No questions found');
    } catch (e) {
        // Offline fallback to last cached questions
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            return (parsed.picked || []).slice(0, count);
        }

        // Last-resort fallback: bundled sample questions (keeps app playable)
        if (isOfflineFirestoreError(e) || (e?.message || '').includes('No questions found')) {
            const picked = pickLocalQuestions({ categoryId, subCategoryId, count }).map((q, idx) => ({
                id: `local-${categoryId || 'daily'}-${subCategoryId || 'mix'}-${idx}`,
                text: q.text,
                options: q.options || [],
                correctIndex: q.correctIndex,
                category: q.category || category?.firestoreName || 'History',
                categoryId: q.categoryId || categoryId || 'history',
                subCategory: q.subCategory || subCategoryId || 'mix',
                difficulty: q.difficulty || 'easy',
                explanation: q.explanation || '',
                imageUrl: q.imageUrl || '',
                roast: q.roast || 'Oof. The quiz gods are disappointed.',
            }));
            if (picked.length) return picked;
        }

        throw e;
    }
}

export function getQuestionTimeLimitSeconds(mode) {
    if (mode === 'practice') return null;
    if (mode === 'daily') return 45;
    if (mode === 'adventure') return 35;
    return 40;
}

export function getQuizCount(mode) {
    if (mode === 'daily') return 10;
    if (mode === 'adventure') return 8;
    if (mode === 'practice') return 6;
    return 8;
}
