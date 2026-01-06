import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateWorkout() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [form, setForm] = useState({
        name: '',
        type: 'standard', // 'standard' or 'guided'
        bodypart: 'General',
        sets: '3',
        imageUrl: '',
        description: ''
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!form.name || !form.bodypart) {
            Alert.alert('Error', 'Please enter a name and body part');
            return;
        }

        try {
            setLoading(true);
            await api.post('/fitness/workouts', {
                ...form,
                sets: Number(form.sets),
                exercises: [], // Empty for now
            });
            Alert.alert('Success', 'Workout created!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create workout');
        } finally {
            setLoading(false);
        }
    };

    const BODY_PARTS = ['General', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio', 'Full Body'];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={[styles.label, { color: colors.text }]}>Workout Name *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="e.g. Full Body Blast"
                placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.text }]}>Target Body Part</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
                {BODY_PARTS.map(part => (
                    <TouchableOpacity
                        key={part}
                        style={[
                            { padding: 8, borderRadius: 8, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.borderColor },
                            form.bodypart === part && { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]}
                        onPress={() => setForm({ ...form, bodypart: part })}
                    >
                        <Text style={[{ color: colors.text }, form.bodypart === part && { color: '#fff' }]}>{part}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Sets</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.sets}
                        onChangeText={(t) => setForm({ ...form, sets: t })}
                        keyboardType="numeric"
                        placeholder="3"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Guided?</Text>
                        <Switch
                            value={form.type === 'guided'}
                            onValueChange={(v) => setForm({ ...form, type: v ? 'guided' : 'standard' })}
                        />
                    </View>
                </View>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>GIF / Image URL</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.imageUrl}
                onChangeText={(t) => setForm({ ...form, imageUrl: t })}
                placeholder="https://example.com/workout.gif"
                placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Describe the workout..."
                placeholderTextColor={colors.textMuted}
                multiline
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Workout'}</Text>
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
