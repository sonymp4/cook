import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateRecipe() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [form, setForm] = useState({
        name: '',
        image: '',
        description: '',
        country: 'US', // Default
        spices: '',
        instructions: '',
        servings: '1',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        prepTime: '',
        category: 'Breakfast',
    });

    const [loading, setLoading] = useState(false);

    const COUNTRIES = [
        { code: 'US', label: '🇺🇸 USA' },
        { code: 'IT', label: '🇮🇹 Italy' },
        { code: 'MX', label: '🇲🇽 Mexico' },
        { code: 'JP', label: '🇯🇵 Japan' },
        { code: 'IN', label: '🇮🇳 India' },
        { code: 'FR', label: '🇫🇷 France' },
        { code: 'CN', label: '🇨🇳 China' },
        { code: 'TH', label: '🇹🇭 Thailand' },
        { code: 'GR', label: '🇬🇷 Greece' }
    ];

    const handleSubmit = async () => {
        if (!form.name || !form.calories) {
            Alert.alert('Error', 'Please fill in required fields (Name, Calories)');
            return;
        }

        try {
            setLoading(true);
            const servings = Number(form.servings || 1);
            const payload = {
                ...form,
                category: form.category.toLowerCase(),
                totalCalories: Number(form.calories) * servings,
                totalProtein: Number(form.protein) * servings,
                totalCarbs: Number(form.carbs) * servings,
                totalFats: Number(form.fats) * servings,
                servings: servings,
                prepTime: Number(form.prepTime),
                spices: form.spices.split(',').map(s => s.trim()).filter(Boolean),
                instructions: form.instructions.split('\n').filter(Boolean),
                ingredients: [], // Optional
            };
            console.log("👉 [FRONTEND] Sending Payload:", JSON.stringify(payload, null, 2));
            const response = await api.post('/recipes', payload);

            if (response.success) {
                Alert.alert('Success', 'Recipe created!');
                router.back();
            } else {
                console.error("❌ [FRONTEND] API Failed:", response.error);
                Alert.alert('Error', response.error || 'Failed to create recipe');
            }
            setLoading(false);
        } catch (error: any) {
            console.error("❌ [FRONTEND] Exception:", error);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
            setLoading(false);
        }

    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={[styles.label, { color: colors.text }]}>Recipe Name *</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="e.g. Avocado Toast"
                placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.text }]}>Cuisine / Country</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {COUNTRIES.map(c => (
                    <TouchableOpacity
                        key={c.code}
                        style={[
                            { padding: 8, marginRight: 8, borderRadius: 8, backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.borderColor },
                            form.country === c.code && { backgroundColor: colors.tint, borderColor: colors.tint }
                        ]}
                        onPress={() => setForm({ ...form, country: c.code })}
                    >
                        <Text style={[{ fontSize: 16 }, form.country === c.code && { color: '#fff' }]}>{c.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.text }]}>Image URL</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.image}
                onChangeText={(t) => setForm({ ...form, image: t })}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Calories *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.calories}
                        onChangeText={(t) => setForm({ ...form, calories: t })}
                        keyboardType="numeric"
                        placeholder="350"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Servings</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.servings}
                        onChangeText={(t) => setForm({ ...form, servings: t })}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Protein (g)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.protein}
                        onChangeText={(t) => setForm({ ...form, protein: t })}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Carbs (g)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.carbs}
                        onChangeText={(t) => setForm({ ...form, carbs: t })}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Fats (g)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                        value={form.fats}
                        onChangeText={(t) => setForm({ ...form, fats: t })}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Spices (comma separated)</Text>
            <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.spices}
                onChangeText={(t) => setForm({ ...form, spices: t })}
                placeholder="Salt, Pepper, Cumin..."
                placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.label, { color: colors.text }]}>Instructions / How to Cook</Text>
            <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top', backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.instructions}
                onChangeText={(t) => setForm({ ...form, instructions: t })}
                placeholder="1. Chop onions..."
                placeholderTextColor={colors.textMuted}
                multiline
            />

            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.borderColor }]}
                value={form.description}
                multiline
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Recipe description..."
                placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Recipe'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
