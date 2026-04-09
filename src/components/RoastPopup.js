import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../config/theme';

export default function RoastPopup({ visible, title, body, onClose }) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.body}>{body}</Text>
                    <Pressable onPress={onClose} style={styles.btn}>
                        <Text style={styles.btnText}>Continue</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    sheet: {
        width: '100%',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
    },
    title: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: theme.spacing.sm,
    },
    body: {
        color: theme.colors.muted,
        fontSize: 15,
        lineHeight: 21,
    },
    btn: {
        marginTop: theme.spacing.lg,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    btnText: {
        color: theme.colors.text,
        fontWeight: '800',
    },
});
