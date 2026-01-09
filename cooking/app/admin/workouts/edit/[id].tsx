import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditWorkout() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        type: 'standard', // 'standard' or 'guided'
        bodypart: 'General',
        sets: '3',
        imageUrl: '',
        description: '',
        exercises: [] as any[]
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newExercise, setNewExercise] = useState({
        name: '',
        sets: '',
        reps: '',
        duration: '',
        breakDuration: '',
        instructions: ''
    });

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const res = await api.get(`/fitness/workouts/${id}`);
                if (res.success && res.data) {
                    const w = res.data;
                    setForm({
                        name: w.name,
                        type: w.type || 'standard',
                        bodypart: w.bodypart,
                        sets: String(w.sets),
                        imageUrl: w.imageUrl || '',
                        description: w.description || '',
                        exercises: w.exercises || []
                    });
                } else {
                    Alert.alert('Error', 'Workout not found');
                    router.back();
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch workout details');
            } finally {
                setLoading(false);
            }
        };
        fetchWorkout();
    }, [id]);

    const handleAddExercise = () => {
        if (!newExercise.name) {
            Alert.alert('Error', 'Exercise name is required');
            return;
        }
        setForm(prev => ({
            ...prev,
            exercises: [...prev.exercises, { ...newExercise, sets: newExercise.sets || prev.sets }]
        }));
        setNewExercise({ name: '', sets: '', reps: '', duration: '', breakDuration: '', instructions: '' });
        setIsAdding(false);
    };

    const removeExercise = (index: number) => {
        const updated = [...form.exercises];
        updated.splice(index, 1);
        setForm(prev => ({ ...prev, exercises: updated }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.bodypart) {
            Alert.alert('Error', 'Please enter a name and body part');
            return;
        }

        try {
            setSubmitting(true);
            await api.put(`/fitness/workouts/${id}`, {
                ...form,
                sets: Number(form.sets),
                exercises: form.exercises.map(ex => ({
                    ...ex,
                    sets: Number(ex.sets),
                    duration: Number(ex.duration),
                    breakDuration: Number(ex.breakDuration)
                }))
            });
            Alert.alert('Success', 'Workout updated!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update workout');
        } finally {
            setSubmitting(false);
        }
    };

    const BODY_PARTS = ['General', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio', 'Full Body'];

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.tint} /></View>;

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

            <View style={styles.divider} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercises ({form.exercises.length})</Text>
                <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={isAdding ? "close-circle" : "add-circle"} size={24} color={colors.tint} />
                    <Text style={{ color: colors.tint, fontWeight: 'bold', marginLeft: 5 }}>{isAdding ? "Cancel" : "Add Exercise"}</Text>
                </TouchableOpacity>
            </View>

            {/* List of Added Exercises */}
            {form.exercises.map((ex, idx) => (
                <View key={idx} style={[styles.exerciseCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.exerciseName, { color: colors.text }]}>{ex.name}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                            {form.type === 'guided'
                                ? `${ex.duration || '300'}s work • ${ex.breakDuration || '30'}s rest`
                                : `${ex.sets} sets • ${ex.reps || '10'} reps`
                            }
                        </Text>
                        {ex.instructions ? <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>{ex.instructions}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => removeExercise(idx)} style={{ padding: 5 }}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            ))}

            {/* Add Exercise Form */}
            {isAdding && (
                <View style={[styles.addForm, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Exercise Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.borderColor }]}
                        value={newExercise.name}
                        onChangeText={(t) => setNewExercise({ ...newExercise, name: t })}
                        placeholder="e.g. Push Ups"
                        placeholderTextColor={colors.textMuted}
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.label, { color: colors.text }]}>Sets</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.borderColor }]}
                                value={newExercise.sets}
                                onChangeText={(t) => setNewExercise({ ...newExercise, sets: t })}
                                keyboardType="numeric"
                                placeholder={form.sets}
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                        {form.type === 'standard' && (
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: colors.text }]}>Reps</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.borderColor }]}
                                    value={newExercise.reps}
                                    onChangeText={(t) => setNewExercise({ ...newExercise, reps: t })}
                                    placeholder="10-12"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        )}
                    </View>

                    {form.type === 'guided' && (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: colors.text }]}>Duration (s)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.borderColor }]}
                                    value={newExercise.duration}
                                    onChangeText={(t) => setNewExercise({ ...newExercise, duration: t })}
                                    keyboardType="numeric"
                                    placeholder="300"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.label, { color: colors.text }]}>Break (s)</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.borderColor }]}
                                    value={newExercise.breakDuration}
                                    onChangeText={(t) => setNewExercise({ ...newExercise, breakDuration: t })}
                                    keyboardType="numeric"
                                    placeholder="30"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>
                    )}

                    <Text style={[styles.label, { color: colors.text }]}>Instructions</Text>
                    <TextInput
                        style={[styles.input, { height: 60, textAlignVertical: 'top', backgroundColor: colors.background, color: colors.text, borderColor: colors.borderColor }]}
                        value={newExercise.instructions}
                        onChangeText={(t) => setNewExercise({ ...newExercise, instructions: t })}
                        placeholder="Tips for form..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                    />

                    <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint, marginTop: 0 }]} onPress={handleAddExercise}>
                        <Text style={styles.buttonText}>Add to Workout</Text>
                    </TouchableOpacity>
                </View>
            )}

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
    divider: { height: 1, backgroundColor: '#ccc', marginVertical: 20, opacity: 0.3 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    exerciseCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
    exerciseName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
    addForm: { padding: 15, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
});
