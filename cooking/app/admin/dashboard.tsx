import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Manage your app content
                </Text>
            </View>

            <View style={styles.grid}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={() => router.push('/admin/recipes')}>
                    <Text style={styles.cardEmoji}>🍲</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Recipes</Text>
                    <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                        Add, edit, or remove recipes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={() => router.push('/admin/workouts')}>
                    <Text style={styles.cardEmoji}>💪</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>Workouts</Text>
                    <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
                        Manage workout plans
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: colors.cardBackground, marginTop: 20, borderColor: colors.borderColor }]}
                onPress={() => router.push('/admin/diagnostics' as any)}>
                <Ionicons name="bug-outline" size={24} color={colors.tint} />
                <View style={styles.menuContent}>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>System Diagnostics</Text>
                    <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>Debug connection and data issues</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.warning }]}
                onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
        marginTop: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    card: {
        width: '47%',
        aspectRatio: 1,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardEmoji: {
        fontSize: 40,
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardDesc: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    logoutButton: {
        marginTop: 40,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
