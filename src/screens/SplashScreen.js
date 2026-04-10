import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>BRAIN BATTLE</Text>
            </View>
            <Text style={styles.title}>Quiz App</Text>
            <Text style={styles.subtitle}>
                Daily streaks, category battles, adventure runs, and leaderboard climbs.
            </Text>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Loading your arena...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.xl,
        justifyContent: 'center',
        backgroundColor: theme.colors.bg,
    },
    badge: {
        alignSelf: 'flex-start',
        borderRadius: 999,
        backgroundColor: 'rgba(255,107,61,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,107,61,0.4)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: theme.spacing.lg,
    },
    badgeText: {
        color: theme.colors.warning,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    title: {
        color: theme.colors.text,
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    subtitle: {
        color: theme.colors.muted,
        fontSize: 18,
        lineHeight: 28,
        marginTop: theme.spacing.md,
        maxWidth: 320,
    },
    footer: {
        marginTop: theme.spacing.xl,
    },
    footerText: {
        color: theme.colors.secondary,
        fontWeight: '800',
        fontSize: 15,
    },
});
