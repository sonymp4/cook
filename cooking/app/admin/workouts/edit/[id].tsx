import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditWorkout() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [form, setForm] = useState({
        name: '',
        type: 'standard',
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchWorkout();
    }, [id]);

    const fetchWorkout = async () => {
        try {
            const response = await api.get<any>(`/fitness/workouts/${id}`);
            if (response.success && response.data) {
                setForm({
                    name: response.data.name,
                    type: response.data.type,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch workout');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await api.put(`/fitness/workouts/${id}`, form);
            Alert.alert('Success', 'Workout updated!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update workout');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.tint} />;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.label, { color: colors.text }]}>Workout Name *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Guided Workout?</Text>
                <Switch
                    value={form.type === 'guided'}
                    onValueChange={(v) => setForm({ ...form, type: v ? 'guided' : 'standard' })}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: submitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={submitting}>
                <Text style={styles.buttonText}>{submitting ? 'Updating...' : 'Update Workout'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    label: { fontWeight: '600', marginBottom: 8, fontSize: 14 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
    button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
