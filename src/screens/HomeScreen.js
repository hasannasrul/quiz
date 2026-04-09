import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../config/theme';
import { CATEGORIES, getDefaultSubCategoryId } from '../config/categories';
import PrimaryButton from '../components/PrimaryButton';
import { firebaseAuth } from '../services/firebase';

export default function HomeScreen({ navigation }) {
    const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
    const selectedCategory = useMemo(
        () => CATEGORIES.find((category) => category.id === categoryId) || CATEGORIES[0],
        [categoryId]
    );
    const isGuest = !!firebaseAuth.currentUser?.isAnonymous;
    const selectedSubCategoryId = getDefaultSubCategoryId(selectedCategory.id);

    function openQuiz(mode) {
        navigation.navigate('QuizPlay', {
            mode,
            categoryId: selectedCategory.id,
            subCategoryId: selectedSubCategoryId,
        });
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.hero}>
                <Text style={styles.eyebrow}>DAILY BRAIN BATTLES</Text>
                <Text style={styles.h1}>Choose your arena</Text>
                <Text style={styles.sub}>Play the free daily quiz, run a genre ladder, and come back as we unlock more levels.</Text>
            </View>

            {isGuest ? (
                <View style={styles.guestBanner}>
                    <Text style={styles.guestTitle}>Playing as Guest</Text>
                    <Text style={styles.guestSub}>You can jump straight into the game now and link an account later.</Text>
                </View>
            ) : null}

            <View style={styles.modeCard}>
                <Text style={styles.modeTitle}>Daily Quiz</Text>
                <Text style={styles.modeBody}>A free mixed run built to bring players back every day.</Text>
                <View style={{ height: theme.spacing.sm }} />
                <PrimaryButton
                    label="Play Daily Quiz"
                    onPress={() => navigation.navigate('QuizPlay', { mode: 'daily' })}
                />
            </View>

            <Text style={styles.section}>Genres</Text>
            <View style={styles.grid}>
                {CATEGORIES.map((category) => (
                    <Pressable
                        key={category.id}
                        onPress={() => setCategoryId(category.id)}
                        style={[
                            styles.categoryCard,
                            {
                                borderColor: category.id === selectedCategory.id ? category.accent : theme.colors.border,
                            },
                        ]}
                    >
                        <Text style={[styles.categoryName, { color: category.id === selectedCategory.id ? theme.colors.text : theme.colors.muted }]}>
                            {category.name}
                        </Text>
                        <Text style={styles.categoryTagline}>{category.tagline}</Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.featureCard}>
                <Text style={styles.featureEyebrow}>{selectedCategory.name.toUpperCase()}</Text>
                <Text style={styles.featureTitle}>{selectedCategory.tagline}</Text>
                <Text style={styles.featureText}>Current lane: {selectedCategory.subCategories.map((item) => item.name).join(' • ')}</Text>
            </View>

            <PrimaryButton
                label={`Play ${selectedCategory.name} Quiz`}
                onPress={() => openQuiz('category')}
            />
            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton
                label="Adventure Mode"
                onPress={() => openQuiz('adventure')}
            />
            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton
                label="Practice Mode"
                onPress={() => openQuiz('practice')}
            />

            <View style={styles.row}>
                <Pressable onPress={() => navigation.navigate('Leaderboard')} style={styles.linkCard}>
                    <Text style={styles.linkCardTitle}>Leaderboard</Text>
                    <Text style={styles.linkCardSub}>See the top climbers and your current rank</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Profile')} style={styles.linkCard}>
                    <Text style={styles.linkCardTitle}>Profile</Text>
                    <Text style={styles.linkCardSub}>Track streaks, points, and account progress</Text>
                </Pressable>
            </View>

            <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionTitle}>Quest Pass</Text>
                <Text style={styles.subscriptionBody}>Keep daily quiz free, then offer a low-cost pass for more adventure levels, events, and exclusive ladders.</Text>
                <View style={{ height: theme.spacing.sm }} />
                <PrimaryButton label="View subscription plan" onPress={() => navigation.navigate('Subscription')} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bg,
    },
    content: {
        padding: theme.spacing.lg,
        paddingBottom: 48,
    },
    hero: {
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.cardAlt,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    eyebrow: {
        color: theme.colors.warning,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 10,
    },
    guestBanner: {
        backgroundColor: 'rgba(39,193,165,0.1)',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(39,193,165,0.25)',
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    guestTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        marginBottom: 4,
    },
    guestSub: {
        color: theme.colors.muted,
    },
    h1: {
        color: theme.colors.text,
        fontSize: 30,
        fontWeight: '900',
    },
    sub: {
        color: theme.colors.muted,
        marginTop: theme.spacing.sm,
        lineHeight: 22,
    },
    section: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 18,
        marginBottom: theme.spacing.sm,
    },
    modeCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    modeTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 20,
    },
    modeBody: {
        color: theme.colors.muted,
        marginTop: 6,
        lineHeight: 20,
    },
    grid: {
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    categoryCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        padding: theme.spacing.md,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '900',
    },
    categoryTagline: {
        color: theme.colors.muted,
        marginTop: 6,
        lineHeight: 20,
    },
    featureCard: {
        backgroundColor: theme.colors.cardAlt,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    featureEyebrow: {
        color: theme.colors.secondary,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 6,
    },
    featureTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 20,
    },
    featureText: {
        color: theme.colors.muted,
        marginTop: 8,
        lineHeight: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginTop: theme.spacing.lg,
    },
    linkCard: {
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
    },
    linkCardTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 16,
    },
    linkCardSub: {
        color: theme.colors.muted,
        marginTop: 6,
    },
    subscriptionCard: {
        marginTop: theme.spacing.lg,
        backgroundColor: 'rgba(255,107,61,0.08)',
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,107,61,0.24)',
        padding: theme.spacing.lg,
    },
    subscriptionTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 22,
    },
    subscriptionBody: {
        color: theme.colors.muted,
        marginTop: 8,
        lineHeight: 21,
    },
});
