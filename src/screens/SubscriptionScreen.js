import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';

const BENEFITS = [
    'Unlimited adventure runs across all quiz genres',
    'Early access to new levels, events, and boss stages',
    'Bonus streak protection on selected days',
    'Premium-only challenge ladders and rewards',
];

export default function SubscriptionScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.hero}>
                <Text style={styles.kicker}>LOW-PRICE SUBSCRIPTION PLAN</Text>
                <Text style={styles.title}>Quest Pass</Text>
                <Text style={styles.subtitle}>
                    Keep the daily quiz free for everyone, then offer a small monthly pass for players who want more modes and progression.
                </Text>
                <Text style={styles.price}>Suggested launch price: $1.99 to $2.99/month</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Why this model fits</Text>
                <Text style={styles.cardBody}>
                    The free loop stays generous: daily quiz, guest play, and selected category runs. Quest Pass becomes the upgrade for committed players, not a wall for new users.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Included at launch</Text>
                {BENEFITS.map((item) => (
                    <Text key={item} style={styles.bullet}>• {item}</Text>
                ))}
            </View>

            <PrimaryButton label="Payments integration next" onPress={() => { }} disabled />
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
        gap: theme.spacing.md,
    },
    hero: {
        backgroundColor: theme.colors.cardAlt,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.xl,
    },
    kicker: {
        color: theme.colors.warning,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: theme.spacing.sm,
    },
    title: {
        color: theme.colors.text,
        fontSize: 30,
        fontWeight: '900',
    },
    subtitle: {
        color: theme.colors.muted,
        marginTop: theme.spacing.md,
        lineHeight: 22,
    },
    price: {
        color: theme.colors.secondary,
        marginTop: theme.spacing.md,
        fontWeight: '900',
    },
    card: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
    },
    cardTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 18,
        marginBottom: theme.spacing.sm,
    },
    cardBody: {
        color: theme.colors.muted,
        lineHeight: 21,
    },
    bullet: {
        color: theme.colors.text,
        lineHeight: 24,
        marginBottom: 6,
    },
});
