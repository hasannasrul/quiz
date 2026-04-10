import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { theme } from '../config/theme';
import { CATEGORIES, getDefaultSubCategoryId } from '../config/categories';
import PrimaryButton from '../components/PrimaryButton';
import { firebaseAuth } from '../services/firebase';
import { getCatalogOverview } from '../services/quiz';
import { getUserDoc } from '../services/user';
import { getRankForLifetime } from '../utils/progression';

export default function HomeScreen({ navigation }) {
    const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
    const [catalog, setCatalog] = useState({ totalQuestions: 0, byCategory: [] });
    const [profile, setProfile] = useState(null);
    const selectedCategory = useMemo(
        () => CATEGORIES.find((category) => category.id === categoryId) || CATEGORIES[0],
        [categoryId]
    );
    const isGuest = !!firebaseAuth.currentUser?.isAnonymous;
    const selectedSubCategoryId = getDefaultSubCategoryId(selectedCategory.id);
    const lifetime = Number(profile?.scores?.lifetime || 0);
    const rank = getRankForLifetime(lifetime);
    const selectedCount =
        catalog.byCategory.find((item) => item.categoryId === selectedCategory.id)?.count || 0;

    useEffect(() => {
        let active = true;
        (async () => {
            const [overview, userDoc] = await Promise.all([
                getCatalogOverview(),
                firebaseAuth.currentUser ? getUserDoc(firebaseAuth.currentUser.uid) : Promise.resolve(null),
            ]);
            if (!active) return;
            setCatalog(overview);
            setProfile(userDoc);
        })();
        return () => {
            active = false;
        };
    }, []);

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
                <Text style={styles.eyebrow}>QUIZ APP</Text>
                <Text style={styles.h1}>One good challenge at a time.</Text>
                <Text style={styles.sub}>Play the free daily quiz first, then jump into your current genre lane.</Text>
                <View style={styles.heroStats}>
                    <View style={styles.heroPill}>
                        <Text style={styles.heroPillLabel}>Question bank</Text>
                        <Text style={styles.heroPillValue}>{catalog.totalQuestions}</Text>
                    </View>
                    <View style={styles.heroPill}>
                        <Text style={styles.heroPillLabel}>Rank</Text>
                        <Text style={[styles.heroPillValue, { color: rank.color }]}>{rank.name}</Text>
                    </View>
                    <View style={styles.heroPill}>
                        <Text style={styles.heroPillLabel}>Streak</Text>
                        <Text style={styles.heroPillValue}>{profile?.streaks?.daily ?? 0}</Text>
                    </View>
                </View>
            </View>

            {isGuest ? (
                <View style={styles.guestBanner}>
                    <Text style={styles.guestTitle}>Playing as Guest</Text>
                    <Text style={styles.guestSub}>You can jump straight into the game now and link an account later.</Text>
                </View>
            ) : null}

            <View style={styles.dailyCard}>
                <View style={styles.dailyCopy}>
                    <Text style={styles.dailyTitle}>Daily Quiz</Text>
                    <Text style={styles.dailyText}>Free mixed questions, streak progress, and the easiest way to get players back every day.</Text>
                </View>
                <PrimaryButton label="Play Daily Quiz" onPress={() => navigation.navigate('QuizPlay', { mode: 'daily' })} />
            </View>

            <Text style={styles.section}>Genres</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRail}>
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
                        <Text style={styles.categoryTagline} numberOfLines={2}>{category.tagline}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            <View style={styles.featureCard}>
                <Text style={styles.featureEyebrow}>CURRENT GENRE</Text>
                <Text style={styles.featureTitle}>{selectedCategory.name}</Text>
                <Text style={styles.featureText}>{selectedCategory.tagline}</Text>
                <Text style={styles.featureMeta}>{selectedCategory.subCategories.map((item) => item.name).join(' • ')}</Text>
                <Text style={styles.featureCount}>{selectedCount} live questions</Text>
                <View style={styles.featureActions}>
                    <View style={styles.featureAction}>
                        <PrimaryButton label={`Play ${selectedCategory.name}`} onPress={() => openQuiz('category')} />
                    </View>
                    <View style={styles.featureActionSpacer} />
                    <View style={styles.featureAction}>
                        <PrimaryButton label="Adventure Mode" onPress={() => openQuiz('adventure')} />
                    </View>
                </View>
            </View>

            <View style={styles.utilityCard}>
                <Text style={styles.utilityTitle}>Warm up</Text>
                <Text style={styles.utilityText}>Practice mode is the low-pressure run for testing a category without the timer pressure.</Text>
                <View style={{ height: theme.spacing.sm }} />
                <PrimaryButton label="Practice Mode" onPress={() => openQuiz('practice')} />
            </View>

            <View style={styles.row}>
                <Pressable onPress={() => navigation.navigate('Leaderboard')} style={styles.linkCard}>
                    <Text style={styles.linkCardTitle}>Leaderboard</Text>
                    <Text style={styles.linkCardSub}>Top players</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Profile')} style={styles.linkCard}>
                    <Text style={styles.linkCardTitle}>Profile</Text>
                    <Text style={styles.linkCardSub}>Your stats</Text>
                </Pressable>
            </View>

            <Pressable style={styles.subscriptionCard} onPress={() => navigation.navigate('Subscription')}>
                <Text style={styles.subscriptionTitle}>Quest Pass</Text>
                <Text style={styles.subscriptionBody}>Low-cost subscription for more levels and bonus ladders.</Text>
            </Pressable>
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
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.cardAlt,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.md,
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
        fontSize: 28,
        fontWeight: '900',
    },
    sub: {
        color: theme.colors.muted,
        marginTop: 8,
        lineHeight: 20,
    },
    heroStats: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    heroPill: {
        flex: 1,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.sm,
    },
    heroPillLabel: {
        color: theme.colors.muted,
        fontSize: 12,
        fontWeight: '700',
    },
    heroPillValue: {
        color: theme.colors.text,
        marginTop: 4,
        fontWeight: '900',
        fontSize: 18,
    },
    section: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 18,
        marginBottom: theme.spacing.sm,
    },
    quickActions: {
        marginBottom: theme.spacing.lg,
    },
    dailyCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    dailyCopy: {
        marginBottom: theme.spacing.sm,
    },
    dailyTitle: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '900',
    },
    dailyText: {
        color: theme.colors.muted,
        marginTop: 6,
        lineHeight: 20,
    },
    genreRail: {
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        paddingRight: theme.spacing.md,
    },
    categoryCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        padding: theme.spacing.md,
        width: 180,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '900',
    },
    categoryTagline: {
        color: theme.colors.muted,
        marginTop: 6,
        lineHeight: 18,
    },
    featureCard: {
        backgroundColor: theme.colors.cardAlt,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
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
        fontSize: 24,
    },
    featureText: {
        color: theme.colors.muted,
        marginTop: 4,
        lineHeight: 20,
    },
    featureMeta: {
        color: theme.colors.secondary,
        marginTop: theme.spacing.sm,
        fontWeight: '800',
    },
    featureCount: {
        color: theme.colors.warning,
        marginTop: 6,
        fontWeight: '800',
    },
    featureActions: {
        marginTop: theme.spacing.md,
    },
    featureAction: {},
    featureActionSpacer: {
        height: theme.spacing.sm,
    },
    utilityCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
    },
    utilityTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
    },
    utilityText: {
        color: theme.colors.muted,
        marginTop: 6,
        lineHeight: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.md,
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
        backgroundColor: 'rgba(255,107,61,0.08)',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,107,61,0.24)',
        padding: theme.spacing.md,
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
