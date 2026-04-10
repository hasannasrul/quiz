import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import { firebaseAuth } from '../services/firebase';
import { submitScore } from '../services/scores';
import { getResultTier } from '../utils/progression';

export default function ResultsScreen({ navigation, route }) {
    const { score = 0, total = 10, subCategoryId = 'ancient', categoryName = 'Mixed', mode = 'category' } = route.params || {};
    const uid = firebaseAuth.currentUser?.uid;
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const tier = getResultTier(score);

    const shareText = useMemo(
        () => `I scored ${score} points on ${categoryName} in Quiz App! Can you beat me?`,
        [score, categoryName]
    );

    async function onShare() {
        await Share.share({ message: shareText });
    }

    async function onSaveScore() {
        if (!uid || saved || saving) return;
        setSaving(true);
        setSaveError('');
        try {
            await submitScore({ uid, score, category: categoryName, subCategory: subCategoryId, mode });
            setSaved(true);
        } catch (e) {
            setSaveError(e?.message || 'Failed to save score');
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        if (!uid) return;
        onSaveScore();
    }, [uid]);

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Run complete</Text>
            <Text style={styles.score}>{score} pts</Text>
            <Text style={styles.sub}>Questions: {total} • Category: {categoryName} • Track: {subCategoryId}</Text>
            <View style={styles.tierCard}>
                <Text style={styles.tierEyebrow}>RUN GRADE</Text>
                <Text style={styles.tierTitle}>{tier.label}</Text>
                <Text style={styles.tierStars}>{'★'.repeat(tier.stars)}{'☆'.repeat(3 - tier.stars)}</Text>
            </View>
            {!!saveError && <Text style={styles.error}>{saveError}</Text>}

            <View style={{ height: theme.spacing.lg }} />

            <PrimaryButton label={saved ? 'Score saved' : saving ? 'Saving…' : 'Save score'} onPress={onSaveScore} disabled={saved || saving || !uid} />
            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton label="Share" onPress={onShare} />
            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton label="Back to Home" onPress={() => navigation.popToTop()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
    },
    h1: {
        color: theme.colors.text,
        fontSize: 26,
        fontWeight: '900',
    },
    score: {
        color: theme.colors.success,
        fontSize: 44,
        fontWeight: '900',
        marginTop: 10,
    },
    sub: {
        color: theme.colors.muted,
        marginTop: 10,
    },
    tierCard: {
        marginTop: theme.spacing.lg,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
    },
    tierEyebrow: {
        color: theme.colors.warning,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
    },
    tierTitle: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '900',
        marginTop: 6,
    },
    tierStars: {
        color: theme.colors.warning,
        fontSize: 24,
        marginTop: 8,
    },
    error: {
        color: theme.colors.danger,
        marginTop: theme.spacing.md,
    },
});
