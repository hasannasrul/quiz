import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

export default function PrimaryButton({ label, onPress, disabled }) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.btn,
                { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
            ]}
        >
            <Text style={styles.text}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
    },
    text: {
        color: theme.colors.text,
        fontWeight: '900',
        fontSize: 16,
    },
});
