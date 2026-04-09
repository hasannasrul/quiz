import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import { isGoogleAuthConfigured, signInEmail, signInGuest } from '../services/auth';

export default function LoginScreen({ navigation }) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const googleReady = isGoogleAuthConfigured();

    async function onEmailLogin() {
        try {
            setBusy(true);
            setError('');
            await signInEmail(email.trim(), password);
        } catch (e) {
            setError(e?.message || 'Login failed');
        } finally {
            setBusy(false);
        }
    }

    async function onGuest() {
        try {
            setBusy(true);
            setError('');
            await signInGuest();
        } catch (e) {
            setError(e?.message || 'Guest sign-in failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.hero}>
                <Text style={styles.eyebrow}>WELCOME TO THE QUIZ ARENA</Text>
                <Text style={styles.h1}>Quiz Royale</Text>
                <Text style={styles.sub}>Play daily free quizzes, climb leaderboards, and unlock new adventure tracks.</Text>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Sign in</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor={theme.colors.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.muted}
                    secureTextEntry
                    style={styles.input}
                />
                <PrimaryButton label={busy ? 'Joining...' : 'Sign in'} onPress={onEmailLogin} disabled={busy} />
            </View>

            <PrimaryButton
                label={busy ? 'Please wait...' : 'Continue with Google'}
                onPress={() => navigation.navigate('GoogleLogin')}
                disabled={busy || !googleReady}
            />
            <View style={{ height: theme.spacing.sm }} />
            <PrimaryButton label={busy ? 'Entering...' : 'Play as Guest'} onPress={onGuest} disabled={busy} />

            <Pressable onPress={() => navigation.navigate('Signup')} style={styles.signupLink}>
                <Text style={styles.signupText}>New here? Create an account</Text>
            </Pressable>

            <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>Tonight's MVP</Text>
                <Text style={styles.note}>Free daily quiz, guest mode, category runs, leaderboards, and the first version of Quest Pass.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    hero: {
        backgroundColor: theme.colors.cardAlt,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    eyebrow: {
        color: theme.colors.warning,
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 10,
    },
    h1: {
        color: theme.colors.text,
        fontSize: 34,
        fontWeight: '900',
    },
    sub: {
        color: theme.colors.muted,
        marginTop: theme.spacing.sm,
        lineHeight: 22,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    cardTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: theme.spacing.md,
    },
    error: {
        color: theme.colors.danger,
        marginBottom: theme.spacing.md,
    },
    input: {
        backgroundColor: theme.colors.bgElevated,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    signupLink: {
        marginTop: theme.spacing.md,
        alignItems: 'center',
    },
    signupText: {
        color: theme.colors.secondary,
        fontWeight: '800',
    },
    noteCard: {
        marginTop: theme.spacing.lg,
        backgroundColor: 'rgba(39,193,165,0.08)',
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(39,193,165,0.22)',
        padding: theme.spacing.md,
    },
    noteTitle: {
        color: theme.colors.text,
        fontWeight: '900',
        marginBottom: 6,
    },
    note: {
        color: theme.colors.muted,
        lineHeight: 18,
    },
});
