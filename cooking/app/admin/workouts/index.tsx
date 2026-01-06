import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Workout {
    _id: string;
    name: string;
    type: string;
}

export default function WorkoutManagement() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    useFocusEffect(
        React.useCallback(() => {
            fetchWorkouts();
        }, [])
    );

    const fetchWorkouts = async () => {
        try {
            // Assuming GET /api/fitness/workouts returns array
            const response = await api.get<Workout[]>('/fitness/workouts');
            // Verify response structure - typically response is just data if using fetch directly or { data: ... }
            // Using helper api.get usually returns { success: true, data: ... } or raw data depending on implementation
            // Checking api.ts implementation might be good, but assuming standard wrapper
            if (Array.isArray(response)) {
                setWorkouts(response);
            } else if (response && (response as any).length !== undefined) {
                setWorkouts(response as any);
            } else {
                // Fallback
                setWorkouts([]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch workouts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Workout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/fitness/workouts/${id}`);
                        fetchWorkouts(); // Refresh
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete workout');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: Workout }) => (
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <View style={styles.content}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.info, { color: colors.textMuted }]}>{item.type}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint }]}
                    onPress={() => router.push(`/admin/workouts/edit/${item._id}`)}>
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.warning, marginLeft: 8 }]}
                    onPress={() => handleDelete(item._id)}>
                    <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/admin/workouts/create')}>
                <Text style={styles.addButtonText}>+ Add New Workout</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color={colors.tint} />
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    addButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    card: { flexDirection: 'row', marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center', justifyContent: 'space-between' },
    content: { flex: 1 },
    name: { fontWeight: 'bold', fontSize: 16 },
    info: { fontSize: 14, marginTop: 4 },
    actions: { flexDirection: 'row' },
    actionButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    actionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
