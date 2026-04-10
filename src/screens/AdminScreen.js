import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp, getDocs, limit, query, writeBatch, doc } from 'firebase/firestore';
import { db, firebaseAuth } from '../services/firebase';
import { uploadQuestionImage } from '../services/storage';
import { CATEGORIES } from '../config/categories';
import { isAdmin as checkAdmin } from '../services/admin';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';

export default function AdminScreen() {
    const user = firebaseAuth.currentUser;
    const [allowed, setAllowed] = useState(false);
    const [busy, setBusy] = useState(false);

    const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
    const [text, setText] = useState('');
    const [opt0, setOpt0] = useState('');
    const [opt1, setOpt1] = useState('');
    const [opt2, setOpt2] = useState('');
    const [opt3, setOpt3] = useState('');
    const [correctIndex, setCorrectIndex] = useState('0');
    const [subCategory, setSubCategory] = useState(CATEGORIES[0].subCategories[0].id);
    const [difficulty, setDifficulty] = useState('easy');
    const [explanation, setExplanation] = useState('');
    const [roast, setRoast] = useState('');
    const [imageUri, setImageUri] = useState('');

    const options = useMemo(() => [opt0, opt1, opt2, opt3].map((s) => s.trim()), [opt0, opt1, opt2, opt3]);
    const selectedCategory = useMemo(
        () => CATEGORIES.find((category) => category.id === categoryId) || CATEGORIES[0],
        [categoryId]
    );

    useEffect(() => {
        setSubCategory(selectedCategory.subCategories[0]?.id || '');
    }, [selectedCategory.id]);

    useEffect(() => {
        (async () => {
            const ok = await checkAdmin(user?.uid);
            setAllowed(ok);
        })();
    }, [user?.uid]);

    async function pickImage() {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (res.canceled) return;
        setImageUri(res.assets?.[0]?.uri || '');
    }

    async function onSave() {
        try {
            if (!allowed) throw new Error('Not authorized');
            if (!text.trim()) throw new Error('Question text required');
            if (options.some((o) => !o)) throw new Error('All 4 options required');
            const ci = Number(correctIndex);
            if (!Number.isInteger(ci) || ci < 0 || ci > 3) throw new Error('Correct index must be 0..3');

            setBusy(true);
            let imageUrl = '';
            if (imageUri) {
                imageUrl = await uploadQuestionImage({ uid: user.uid, localUri: imageUri });
            }
            await addDoc(collection(db, 'Questions'), {
                text: text.trim(),
                options,
                correctIndex: ci,
                category: selectedCategory.firestoreName,
                categoryId,
                subCategory,
                difficulty,
                explanation: explanation.trim(),
                roast: roast.trim(),
                imageUrl,
                createdAt: serverTimestamp(),
            });
            Alert.alert('Saved', 'Question added');
            setText('');
            setOpt0('');
            setOpt1('');
            setOpt2('');
            setOpt3('');
            setExplanation('');
            setRoast('');
            setImageUri('');
        } catch (e) {
            Alert.alert('Error', e?.message || 'Failed');
        } finally {
            setBusy(false);
        }
    }

    async function onSeed() {
        try {
            if (!allowed) throw new Error('Not authorized');
            setBusy(true);

            const q = query(collection(db, 'Questions'), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                Alert.alert('Already has questions', 'Your Firestore already contains questions.');
                return;
            }

            const batch = writeBatch(db);
            SAMPLE_QUESTIONS.forEach((q) => {
                const ref = doc(collection(db, 'Questions'));
                batch.set(ref, {
                    ...q,
                    createdAt: serverTimestamp(),
                });
            });
            await batch.commit();
            Alert.alert('Seeded', `Added ${SAMPLE_QUESTIONS.length} sample questions.`);
        } catch (e) {
            Alert.alert('Error', e?.message || 'Failed');
        } finally {
            setBusy(false);
        }
    }

    if (!allowed) {
        return (
            <View style={styles.container}>
                <Text style={styles.h1}>Admin</Text>
                <Text style={styles.sub}>You are not authorized.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.h1}>Admin panel</Text>
            <Text style={styles.sub}>Quick import guidance plus a lightweight one-question entry form.</Text>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Bulk import workflow</Text>
                <Text style={styles.infoText}>Edit `data/questions.sample.csv` or a larger CSV, then run the importer from the `functions` folder with your Firebase service account JSON.</Text>
                <Text style={styles.infoText}>Required columns: text, optionA-D, correctIndex, category, categoryId, subCategory, difficulty.</Text>
            </View>

            <PrimaryButton label={busy ? 'Please wait…' : 'Seed sample questions'} onPress={onSeed} disabled={busy} />
            <View style={{ height: theme.spacing.md }} />

            <Text style={styles.label}>Category</Text>
            <View style={styles.pillRow}>
                {CATEGORIES.map((category) => (
                    <Pressable
                        key={category.id}
                        onPress={() => setCategoryId(category.id)}
                        style={[styles.pill, categoryId === category.id && styles.pillActive]}
                    >
                        <Text style={styles.pillText}>{category.name}</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.label}>Sub-category</Text>
            <View style={styles.pillRow}>
                {selectedCategory.subCategories.map((item) => (
                    <Pressable
                        key={item.id}
                        onPress={() => setSubCategory(item.id)}
                        style={[styles.pill, subCategory === item.id && styles.pillActive]}
                    >
                        <Text style={styles.pillText}>{item.name}</Text>
                    </Pressable>
                ))}
            </View>

            <TextInput value={text} onChangeText={setText} placeholder="Question text" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={opt0} onChangeText={setOpt0} placeholder="Option A" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={opt1} onChangeText={setOpt1} placeholder="Option B" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={opt2} onChangeText={setOpt2} placeholder="Option C" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={opt3} onChangeText={setOpt3} placeholder="Option D" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={correctIndex} onChangeText={setCorrectIndex} placeholder="Correct index (0..3)" placeholderTextColor={theme.colors.muted} style={styles.input} keyboardType="number-pad" />
            <TextInput value={difficulty} onChangeText={setDifficulty} placeholder="difficulty (easy/medium/hard)" placeholderTextColor={theme.colors.muted} style={styles.input} />
            <TextInput value={explanation} onChangeText={setExplanation} placeholder="Explanation" placeholderTextColor={theme.colors.muted} style={[styles.input, { height: 90 }]} multiline />
            <TextInput value={roast} onChangeText={setRoast} placeholder="Roast text (shown on wrong answer)" placeholderTextColor={theme.colors.muted} style={[styles.input, { height: 70 }]} multiline />

            <PrimaryButton label={imageUri ? 'Change image' : 'Pick image'} onPress={pickImage} disabled={busy} />
            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton label={busy ? 'Saving…' : 'Save question'} onPress={onSave} disabled={busy} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg },
    h1: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
    sub: { color: theme.colors.muted, marginTop: 8, marginBottom: theme.spacing.lg },
    infoCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    infoTitle: { color: theme.colors.text, fontWeight: '900', marginBottom: 8 },
    infoText: { color: theme.colors.muted, lineHeight: 19, marginBottom: 6 },
    label: {
        color: theme.colors.text,
        fontWeight: '800',
        marginBottom: 8,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: theme.spacing.md,
    },
    pill: {
        backgroundColor: theme.colors.card,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    pillActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.cardAlt,
    },
    pillText: {
        color: theme.colors.text,
        fontWeight: '700',
    },
    input: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
});
