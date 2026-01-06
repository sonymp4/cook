import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditRecipe() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [form, setForm] = useState({
        name: '',
        image: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        prepTime: '',
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRecipe();
    }, [id]);

    const fetchRecipe = async () => {
        try {
            const response = await api.get<any>(`/recipes/${id}`);
            if (response.success && response.data) {
                const r = response.data;
                setForm({
                    name: r.name,
                    image: r.image,
                    description: r.description || '',
                    calories: String(r.calories || ''),
                    protein: String(r.protein || ''),
                    carbs: String(r.carbs || ''),
                    fats: String(r.fats || ''),
                    prepTime: String(r.prepTime || ''),
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch recipe');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await api.put(`/recipes/${id}`, {
                ...form,
                calories: Number(form.calories),
                protein: Number(form.protein),
                carbs: Number(form.carbs),
                fats: Number(form.fats),
                prepTime: Number(form.prepTime),
            });
            Alert.alert('Success', 'Recipe updated!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update recipe');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.tint} />;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.label, { color: colors.text }]}>Recipe Name *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
            />

            <Text style={[styles.label, { color: colors.text }]}>Image URL *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.image}
                onChangeText={(t) => setForm({ ...form, image: t })}
            />

            <Text style={[styles.label, { color: colors.text }]}>Calories *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.calories}
                onChangeText={(t) => setForm({ ...form, calories: t })}
                keyboardType="numeric"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Protein (g)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.protein}
                        onChangeText={(t) => setForm({ ...form, protein: t })}
                        keyboardType="numeric"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Carbs (g)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.carbs}
                        onChangeText={(t) => setForm({ ...form, carbs: t })}
                        keyboardType="numeric"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Fats (g)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.fats}
                        onChangeText={(t) => setForm({ ...form, fats: t })}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.description}
                multiline
                onChangeText={(t) => setForm({ ...form, description: t })}
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: submitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={submitting}>
                <Text style={styles.buttonText}>{submitting ? 'Updating...' : 'Update Recipe'}</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
