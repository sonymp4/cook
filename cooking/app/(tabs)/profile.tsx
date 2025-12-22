import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { api } from '@/constants/api';

interface Recipe {
  _id: string;
  name: string;
  description?: string;
  servings: number;
  totalCalories: number;
  totalProtein: number;
  perServing?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  category: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get<Recipe[]>('/users/favorites');
      if (response.success) {
        setRecipes(response.data || []);
      }
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    Alert.alert('Remove Recipe', 'Remove this recipe from your saved recipes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/users/favorites/${recipeId}`);
            setRecipes(recipes.filter((r) => r._id !== recipeId));
            Alert.alert('Success', 'Recipe removed from favorites');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to remove recipe');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: '#E3F2FD' }]}>
        <Text style={styles.emoji}>👨‍🍳</Text>
        <Text style={[styles.title, { color: '#1A1A1A' }]}>Please login first</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#E3F2FD' }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.statNumber, { color: '#FF8A65' }]}>{recipes.length}</Text>
          <Text style={[styles.statLabel, { color: '#666666' }]}>Saved recipes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.statNumber, { color: '#FF8A65' }]}>
            {recipes.reduce((a, b) => a + (b.perServing?.calories || b.totalCalories), 0)}
          </Text>
          <Text style={[styles.statLabel, { color: '#666666' }]}>Total calories</Text>
        </View>
      </View>

      {/* Saved recipes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#1A1A1A' }]}>📖 Your Favorites</Text>

        {loading ? (
          <Text style={[styles.muted, { color: '#666666' }]}>Loading…</Text>
        ) : recipes.length === 0 ? (
          <Text style={[styles.muted, { color: '#666666' }]}>No saved recipes yet 🍽️</Text>
        ) : (
          recipes.map((r) => (
            <View key={r._id} style={styles.recipeCardWrapper}>
              <TouchableOpacity
                style={[styles.recipeCard, { backgroundColor: '#FFFFFF' }]}
                onPress={() => router.push(`/(tabs)/recipe/${r._id}`)}
                activeOpacity={0.7}>
                <View style={styles.recipeCardContent}>
                  <Text style={[styles.recipeName, { color: '#1A1A1A' }]}>{r.name}</Text>
                  {r.description && (
                    <Text style={[styles.recipeDesc, { color: '#555555' }]} numberOfLines={2}>
                      {r.description}
                    </Text>
                  )}
                  <View style={styles.metaRow}>
                    <Text style={[styles.meta, { color: '#666666' }]}>🍽 {r.servings}</Text>
                    <Text style={[styles.meta, { color: '#666666' }]}>
                      🔥 {Math.round(r.perServing?.calories || r.totalCalories)} kcal
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(r._id)}>
                <Text style={styles.removeIcon}>❌</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.warning }]}
        onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 80, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700' },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FF8A65',
  },
  name: { fontSize: 24, fontWeight: '800', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statNumber: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  muted: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  recipeCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  recipeCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recipeCardContent: {
    flex: 1,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  recipeDesc: { fontSize: 14, marginBottom: 8 },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  meta: { fontSize: 12, fontWeight: '600' },
  removeButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 20,
  },
  logoutButton: {
    margin: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
