import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import { signUpEmail } from '../services/auth';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function onSignup() {
        try {
            setError('');
            if (password.length < 6) throw new Error('Password must be at least 6 characters');
            if (password !== confirm) throw new Error('Passwords do not match');
            setBusy(true);
            await signUpEmail(email.trim(), password);
        } catch (e) {
            setError(e?.message || 'Signup failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Create account</Text>
            <Text style={styles.sub}>Start your History Quest.</Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

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
            <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm password"
                placeholderTextColor={theme.colors.muted}
                secureTextEntry
                style={styles.input}
            />

            <PrimaryButton label={busy ? 'Creating…' : 'Create Account'} onPress={onSignup} disabled={busy} />

            <Pressable onPress={() => navigation.goBack()} style={styles.linkWrap}>
                <Text style={styles.link}>Back to login</Text>
            </Pressable>
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
        fontSize: 28,
        fontWeight: '900',
    },
    sub: {
        color: theme.colors.muted,
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
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
    error: {
        color: theme.colors.danger,
        marginBottom: theme.spacing.sm,
    },
    linkWrap: { marginTop: theme.spacing.lg, alignItems: 'center' },
    link: { color: theme.colors.muted, textDecorationLine: 'underline' },
});
