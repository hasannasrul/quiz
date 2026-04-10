import { collection, getCountFromServer, getDocs, limit, query, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import shuffle from 'lodash.shuffle';
import { db } from './firebase';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { CATEGORIES, getCategoryById } from '../config/categories';

function getCacheKey({ categoryId, subCategoryId, count }) {
    return `hq:questions:v2:${categoryId || 'daily'}:${subCategoryId || 'mix'}:${count}`;
}

function isOfflineFirestoreError(e) {
    const msg = (e?.message || '').toLowerCase();
    const code = (e?.code || '').toLowerCase();
    return msg.includes('client is offline') || code.includes('unavailable');
}

function sanitizeQuestion(docSnap) {
    const data = docSnap.data();
    const options = Array.isArray(data.options)
        ? data.options
        : typeof data.options === 'string'
            ? data.options.split('|').map((item) => item.trim()).filter(Boolean)
            : [];
    const correctIndexRaw = Number(data.correctIndex);
    const safeCorrectIndex = Number.isInteger(correctIndexRaw) ? correctIndexRaw : 0;

    return {
        id: docSnap.id,
        text: data.text,
        options,
        correctIndex: safeCorrectIndex,
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
    const cacheKey = getCacheKey({ categoryId, subCategoryId, count });
    try {
        const base = collection(db, 'Questions');
        const cap = Math.max(count * 3, count);

        // Prefer categoryId query for speed/consistency. Fallback to category name for legacy docs.
        const byIdClauses = [];
        if (categoryId) byIdClauses.push(where('categoryId', '==', categoryId));
        if (subCategoryId) byIdClauses.push(where('subCategory', '==', subCategoryId));
        const byIdSnap = await getDocs(query(base, ...byIdClauses, limit(cap)));
        let questions = byIdSnap.docs.map(sanitizeQuestion);

        if (!questions.length) {
            const legacyClauses = [];
            if (category?.firestoreName) legacyClauses.push(where('category', '==', category.firestoreName));
            if (subCategoryId) legacyClauses.push(where('subCategory', '==', subCategoryId));
            const legacySnap = await getDocs(query(base, ...legacyClauses, limit(cap)));
            questions = legacySnap.docs.map(sanitizeQuestion);
        }

        const picked = shuffle(questions).slice(0, count).filter((q) => q.options.length >= 2);
        if (picked.length) {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), picked }));
            return picked;
        }
        throw new Error('No questions found');
    } catch (e) {
        // Offline fallback to last cached questions
        const cached = await AsyncStorage.getItem(cacheKey);
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
            })).filter((q) => q.options.length >= 2);
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

export async function getCatalogOverview() {
    try {
        const totalSnap = await getCountFromServer(collection(db, 'Questions'));
        const totals = await Promise.all(
            CATEGORIES.map(async (category) => {
                const snap = await getCountFromServer(
                    query(collection(db, 'Questions'), where('categoryId', '==', category.id))
                );
                return {
                    categoryId: category.id,
                    count: snap.data().count,
                };
            })
        );

        return {
            totalQuestions: totalSnap.data().count,
            byCategory: totals,
        };
    } catch (e) {
        return {
            totalQuestions: SAMPLE_QUESTIONS.length,
            byCategory: CATEGORIES.map((category) => ({
                categoryId: category.id,
                count: SAMPLE_QUESTIONS.filter((question) => question.categoryId === category.id).length,
            })),
        };
    }
}
