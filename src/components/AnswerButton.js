import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

export default function AnswerButton({ text, onPress, disabled, variant = 'default' }) {
    const bg =
        variant === 'correct'
            ? theme.colors.success
            : variant === 'wrong'
                ? theme.colors.danger
                : theme.colors.card;

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.btn,
                { backgroundColor: bg, opacity: disabled ? 0.6 : pressed ? 0.85 : 1 },
            ]}
        >
            <Text style={styles.text}>{text}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.sm,
    },
    text: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
});
