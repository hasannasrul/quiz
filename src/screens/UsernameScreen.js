import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../config/theme';
import PrimaryButton from '../components/PrimaryButton';
import { firebaseAuth } from '../services/firebase';
import { setUsername, validateUsername } from '../services/user';

export default function UsernameScreen() {
    const [username, setUsernameValue] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const hint = useMemo(() => {
        const msg = validateUsername(username);
        return msg ? msg : 'Looks good';
    }, [username]);

    async function onSave() {
        try {
            const uid = firebaseAuth.currentUser?.uid;
            if (!uid) throw new Error('Not signed in');
            setBusy(true);
            setError('');
            await setUsername(uid, username);
        } catch (e) {
            setError(e?.message || 'Failed to set username');
        } finally {
            setBusy(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Pick your username</Text>
            <Text style={styles.sub}>This is how you’ll appear on leaderboards.</Text>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TextInput
                value={username}
                onChangeText={setUsernameValue}
                placeholder="e.g. history_buff"
                placeholderTextColor={theme.colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
            />
            <Text style={[styles.hint, hint === 'Looks good' ? styles.hintOk : null]}>{hint}</Text>

            <View style={{ height: theme.spacing.md }} />
            <PrimaryButton label={busy ? 'Saving…' : 'Continue'} onPress={onSave} disabled={busy} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg, justifyContent: 'center' },
    h1: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
    sub: { color: theme.colors.muted, marginTop: 8, marginBottom: theme.spacing.lg },
    error: { color: theme.colors.danger, marginBottom: theme.spacing.md },
    input: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text,
    },
    hint: { marginTop: 10, color: theme.colors.muted },
    hintOk: { color: theme.colors.success, fontWeight: '800' },
});
