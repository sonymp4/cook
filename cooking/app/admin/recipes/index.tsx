import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { api } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Recipe {
    _id: string;
    name: string;
    image: string;
    calories: number;
}

export default function RecipeManagement() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    useFocusEffect(
        React.useCallback(() => {
            fetchRecipes();
        }, [])
    );

    const fetchRecipes = async () => {
        try {
            const response = await api.get<Recipe[]>(`/recipes?_t=${new Date().getTime()}`);
            if (response.success && response.data) {
                setRecipes(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Recipe', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/recipes/${id}`);
                        fetchRecipes(); // Refresh
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete recipe');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: Recipe }) => (
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.content}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.info, { color: colors.textMuted }]}>{item.calories} kcal</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.tint }]}
                    onPress={() => router.push(`/admin/recipes/edit/${item._id}`)}>
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
                onPress={() => router.push('/admin/recipes/create')}>
                <Text style={styles.addButtonText}>+ Add New Recipe</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color={colors.tint} />
            ) : (
                <FlatList
                    data={recipes}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    addButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        alignItems: 'center',
        padding: 10,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    content: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    info: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
