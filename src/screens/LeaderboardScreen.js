import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../config/theme';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function LeaderboardScreen() {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setError('');
                const q = query(collection(db, 'Scores'), orderBy('score', 'desc'), limit(30));
                const snap = await getDocs(q);
                setRows(
                    snap.docs.map((d) => ({
                        id: d.id,
                        ...d.data(),
                    }))
                );
            } catch (e) {
                setError(e?.message || 'Failed to load leaderboard');
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Leaderboard</Text>
            {!!error && <Text style={styles.error}>{error}</Text>}
            <FlatList
                data={rows}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.row}>
                        <Text style={styles.rank}>#{index + 1}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.user}>{item.username || 'Guest Challenger'}</Text>
                            <Text style={styles.meta}>{item.subCategory || '—'} • {item.category || 'Mixed'}</Text>
                        </View>
                        <Text style={styles.score}>{item.score}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: theme.spacing.lg },
    h1: { color: theme.colors.text, fontSize: 24, fontWeight: '900', marginBottom: theme.spacing.md },
    error: { color: theme.colors.danger, marginBottom: theme.spacing.md },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: 10,
    },
    rank: { color: theme.colors.muted, width: 44, fontWeight: '900' },
    user: { color: theme.colors.text, fontWeight: '800' },
    meta: { color: theme.colors.muted, marginTop: 2 },
    score: { color: theme.colors.success, fontWeight: '900', fontSize: 18 },
});
