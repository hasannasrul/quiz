import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import { firebaseAuth } from '../services/firebase';
import { getUserDoc } from '../services/user';
import { signOutUser } from '../services/auth';
import { isAdmin as checkAdmin } from '../services/admin';
import { getRankForLifetime } from '../utils/progression';

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState(null);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const user = firebaseAuth.currentUser;
    const rank = getRankForLifetime(profile?.scores?.lifetime || 0);

    useEffect(() => {
        (async () => {
            if (!user) return;
            const [doc, adminStatus] = await Promise.all([
                getUserDoc(user.uid),
                checkAdmin(user.uid),
            ]);
            setProfile(doc);
            setIsAdminUser(adminStatus);
        })();
    }, [user?.uid]);

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Profile</Text>
            <Text style={styles.sub}>{user?.email || '—'}</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Stats</Text>
                <Text style={styles.line}>Rank: {rank.name}</Text>
                <Text style={styles.line}>High score: {profile?.scores?.highScore ?? 0}</Text>
                <Text style={styles.line}>Lifetime points: {profile?.scores?.lifetime ?? 0}</Text>
                <Text style={styles.line}>Daily streak: {profile?.streaks?.daily ?? 0}</Text>
                <Text style={styles.line}>Premium: {profile?.isPremium ? 'Yes' : 'No'}</Text>
            </View>

            {isAdminUser ? (
                <>
                    <PrimaryButton label="Admin tools" onPress={() => navigation.navigate('Admin')} />
                    <View style={{ height: theme.spacing.sm }} />
                </>
            ) : null}
            <PrimaryButton label="Sign out" onPress={signOutUser} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg },
    h1: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
    sub: { color: theme.colors.muted, marginTop: 8, marginBottom: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    cardTitle: { color: theme.colors.text, fontWeight: '900', marginBottom: theme.spacing.sm },
    line: { color: theme.colors.muted, marginBottom: 6 },
});
