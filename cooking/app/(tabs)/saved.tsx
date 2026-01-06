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
import AnimatedPressable from '@/components/AnimatedPressable';

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
  country?: string;
}

const getCountryFlag = (country?: string) => {
  if (!country) return '🌍';
  const countryLower = country.toLowerCase();
  const flagMap: { [key: string]: string } = {
    'italy': '🇮🇹', 'japan': '🇯🇵', 'mexico': '🇲🇽', 'india': '🇮🇳',
    'thailand': '🇹🇭', 'south korea': '🇰🇷', 'korea': '🇰🇷', 'spain': '🇪🇸',
    'united states': '🇺🇸', 'usa': '🇺🇸', 'france': '🇫🇷', 'china': '🇨🇳',
    'brazil': '🇧🇷', 'greece': '🇬🇷', 'vietnam': '🇻🇳', 'indonesia': '🇮🇩',
    'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'britain': '🇬🇧', 'morocco': '🇲🇦',
    'turkey': '🇹🇷', 'germany': '🇩🇪', 'portugal': '🇵🇹', 'russia': '🇷🇺',
    'egypt': '🇪🇬', 'lebanon': '🇱🇧', 'israel': '🇮🇱', 'international': '🌍',
  };
  return flagMap[countryLower] || '🌍';
};

export default function SavedScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get<Recipe[]>('/users/favorites');
      if (response.success) {
        setRecipes(response.data || []);
      } else {
        setRecipes([]);
      }
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={styles.bigEmoji}>📖</Text>
        <Text style={[styles.title, { color: '#1A1A1A' }]}>Login required</Text>
        <Text style={[styles.subtitle, { color: '#555555' }]}>
          Please login to view your saved recipes
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <Text style={[styles.headerTitle, { color: '#fff' }]}>📖 My Saved Recipes</Text>
        <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFavorites} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.center}>
            <Text style={styles.bigEmoji}>🍳</Text>
            <Text style={[styles.subtitle, { color: '#555555' }]}>Loading...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.bigEmoji}>🍽️</Text>
            <Text style={[styles.title, { color: '#1A1A1A' }]}>No saved recipes yet</Text>
            <Text style={[styles.subtitle, { color: '#555555' }]}>
              Start exploring and save your favorite recipes!
            </Text>
            <AnimatedPressable
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/explore')}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Explore Recipes
              </Text>
            </AnimatedPressable>
          </View>
        ) : (
          recipes.map((recipe) => (
            <AnimatedPressable
              key={recipe._id}
              style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
              onPress={() => router.push(`/(tabs)/recipe/${recipe._id}`)}>
              <View style={styles.cardHeader}>
                <View style={styles.cardContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.recipeName, { color: '#1A1A1A' }]} numberOfLines={2}>
                      {recipe.name}
                    </Text>
                    {recipe.country && (
                      <Text style={styles.flagEmoji}>{getCountryFlag(recipe.country)}</Text>
                    )}
                  </View>
                  {recipe.description && (
                    <Text style={[styles.recipeDesc, { color: '#555555' }]} numberOfLines={2}>
                      {recipe.description}
                    </Text>
                  )}
                  <View style={styles.metaRow}>
                    <Text style={[styles.meta, { color: '#666666' }]}>🍽️ {recipe.servings} servings</Text>
                    <Text style={[styles.meta, { color: '#666666' }]}>
                      🔥 {Math.round(recipe.perServing?.calories || recipe.totalCalories)} cal
                    </Text>
                    <Text style={[styles.meta, { color: '#666666' }]}>
                      💪 {recipe.perServing?.protein?.toFixed(1) || recipe.totalProtein?.toFixed(1) || '0.0'}g protein
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(recipe._id);
                  }}>
                  <Text style={styles.removeIcon}>❌</Text>
                </TouchableOpacity>
              </View>
            </AnimatedPressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 70,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  headerSubtitle: { fontSize: 14 },
  list: { padding: 20, paddingBottom: 40 },
  center: { alignItems: 'center', marginTop: 80 },
  bigEmoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  button: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 22,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  flagEmoji: {
    fontSize: 24,
  },
  recipeDesc: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 20,
  },
});


