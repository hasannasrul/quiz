import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

export default function QuestionCard({ question, metaText }) {
    return (
        <View style={styles.card}>
            {!!metaText && <Text style={styles.meta}>{metaText}</Text>}
            <Text style={styles.title}>{question?.text}</Text>
            {!!question?.imageUrl && (
                <Image source={{ uri: question.imageUrl }} style={styles.image} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    meta: {
        color: theme.colors.muted,
        marginBottom: theme.spacing.sm,
    },
    title: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '800',
        lineHeight: 24,
    },
    image: {
        marginTop: theme.spacing.md,
        width: '100%',
        height: 180,
        borderRadius: theme.radius.md,
    },
});
