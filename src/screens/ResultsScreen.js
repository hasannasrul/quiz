import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import { firebaseAuth } from '../services/firebase';
import { submitScore } from '../services/scores';

export default function ResultsScreen({ navigation, route }) {
    const { score = 0, total = 10, subCategoryId = 'ancient', categoryName = 'Mixed' } = route.params || {};
    const uid = firebaseAuth.currentUser?.uid;

    const shareText = useMemo(
        () => `I scored ${score} points on ${categoryName} in Quiz Royale! Can you beat me?`,
        [score, categoryName]
    );

    async function onShare() {
        await Share.share({ message: shareText });
    }

    async function onSaveScore() {
        if (!uid) return;
        await submitScore({ uid, score, category: categoryName, subCategory: subCategoryId });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Run complete</Text>
            <Text style={styles.score}>{score} pts</Text>
            <Text style={styles.sub}>Questions: {total} • Category: {categoryName} • Track: {subCategoryId}</Text>

            <View style={{ height: theme.spacing.lg }} />

            <PrimaryButton label="Save score" onPress={onSaveScore} />
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
});
