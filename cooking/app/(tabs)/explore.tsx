import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
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
  country?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  perServing?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  servings: number;
  prepTime?: number;
  cookTime?: number;
  ingredients: Array<{
    ingredient: {
      name: string;
    };
    quantity: number;
    unit: string;
  }>;
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

export default function ExploreScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    country: '',
    minPrepTime: '',
    maxPrepTime: '',
    minCookTime: '',
    maxCookTime: '',
    minProtein: '',
    maxProtein: '',
    minCarbs: '',
    maxCarbs: '',
    minFats: '',
    maxFats: '',
    minCalories: '',
    maxCalories: '',
    ingredient: '',
  });
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadRecipes();
  }, []);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const query = buildQueryString();
      const endpoint = query ? `/recipes?${query}` : '/recipes';
      const response = await api.get<Recipe[]>(endpoint);
      if (response.success) {
        setRecipes(response.data || []);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const applyFilters = () => {
    setFilterVisible(false);
    loadRecipes();
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      minPrepTime: '',
      maxPrepTime: '',
      minCookTime: '',
      maxCookTime: '',
      minProtein: '',
      maxProtein: '',
      minCarbs: '',
      maxCarbs: '',
      minFats: '',
      maxFats: '',
      minCalories: '',
      maxCalories: '',
      ingredient: '',
    });
    setFilterVisible(false);
    loadRecipes();
  };

  const handleAddFavorite = async (recipeId: string, e: any) => {
    e.stopPropagation();
    if (!user) {
      Alert.alert('Login Required', 'Please login to save recipes');
      return;
    }
    try {
      await api.post(`/users/favorites/${recipeId}`, {});
      Alert.alert('Success', 'Recipe added to favorites! ❤️');
    } catch (error: any) {
      if (error.message?.includes('already')) {
        Alert.alert('Already Saved', 'This recipe is already in your favorites');
      } else {
        Alert.alert('Error', error.message || 'Failed to save recipe');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <Text style={styles.headerTitle}>🥄 Explore Recipes</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}>
          <Text style={styles.filterButtonText}>🔍 Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}>
        {loading && recipes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.bigEmoji}>🍳</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Loading recipes...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.bigEmoji}>🍽️</Text>
            <Text style={[styles.title, { color: colors.text }]}>No recipes found</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        ) : (
          recipes.map((recipe) => {
            const calories = Math.round(recipe.perServing?.calories || recipe.totalCalories / recipe.servings || 0);
            const protein = (recipe.perServing?.protein || recipe.totalProtein / recipe.servings || 0).toFixed(1);
            const carbs = (recipe.perServing?.carbs || recipe.totalCarbs / recipe.servings || 0).toFixed(1);
            const fats = (recipe.perServing?.fats || recipe.totalFats / recipe.servings || 0).toFixed(1);

            return (
              <TouchableOpacity
                key={recipe._id}
                style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
                onPress={() => router.push(`/(tabs)/recipe/${recipe._id}`)}
                activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.recipeName, { color: '#1A1A1A' }]} numberOfLines={2}>
                      {recipe.name}
                    </Text>
                    {recipe.country && (
                      <Text style={styles.flagEmoji}>{getCountryFlag(recipe.country)}</Text>
                    )}
                  </View>
                  {user && (
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={(e) => handleAddFavorite(recipe._id, e)}>
                      <Text style={styles.favoriteIcon}>❤️</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {recipe.description && (
                  <Text style={[styles.description, { color: '#555555' }]} numberOfLines={2}>
                    {recipe.description}
                  </Text>
                )}

                <View style={styles.ingredientsContainer}>
                  {recipe.ingredients.slice(0, 5).map((item, idx) => (
                    <View key={idx} style={[styles.ingredientTag, { backgroundColor: '#FFF9F5', borderColor: '#E0E0E0' }]}>
                      <Text style={[styles.ingredientText, { color: '#1A1A1A' }]}>
                        {item.ingredient?.name}
                      </Text>
                    </View>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <Text style={[styles.moreIngredients, { color: '#666666' }]}>
                      +{recipe.ingredients.length - 5} more
                    </Text>
                  )}
                </View>

                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionBox}>
                    <Text style={styles.nutritionEmoji}>🔥</Text>
                    <Text style={[styles.nutritionValue, { color: '#1A1A1A' }]}>{calories}</Text>
                    <Text style={[styles.nutritionLabel, { color: '#666666' }]}>Cal</Text>
                  </View>
                  <View style={styles.nutritionBox}>
                    <Text style={styles.nutritionEmoji}>💪</Text>
                    <Text style={[styles.nutritionValue, { color: '#1A1A1A' }]}>{protein}g</Text>
                    <Text style={[styles.nutritionLabel, { color: '#666666' }]}>Protein</Text>
                  </View>
                  <View style={styles.nutritionBox}>
                    <Text style={styles.nutritionEmoji}>🍞</Text>
                    <Text style={[styles.nutritionValue, { color: '#1A1A1A' }]}>{carbs}g</Text>
                    <Text style={[styles.nutritionLabel, { color: '#666666' }]}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionBox}>
                    <Text style={styles.nutritionEmoji}>🧈</Text>
                    <Text style={[styles.nutritionValue, { color: '#1A1A1A' }]}>{fats}g</Text>
                    <Text style={[styles.nutritionLabel, { color: '#666666' }]}>Fats</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              style={styles.modalScroll}>
              <Text style={[styles.modalTitle, { color: '#1A1A1A' }]}>🔍 Filter Recipes</Text>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Country</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                value={filters.country}
                onChangeText={(text) => setFilters({ ...filters, country: text })}
                placeholder="e.g., Italy, Japan"
                placeholderTextColor="#999999"
                blurOnSubmit={false}
                returnKeyType="next"
              />

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Prep Time (min)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.minPrepTime}
                  onChangeText={(text) => setFilters({ ...filters, minPrepTime: text })}
                  placeholder="Min"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.maxPrepTime}
                  onChangeText={(text) => setFilters({ ...filters, maxPrepTime: text })}
                  placeholder="Max"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Cook Time (min)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.minCookTime}
                  onChangeText={(text) => setFilters({ ...filters, minCookTime: text })}
                  placeholder="Min"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.maxCookTime}
                  onChangeText={(text) => setFilters({ ...filters, maxCookTime: text })}
                  placeholder="Max"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Calories (per serving)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.minCalories}
                  onChangeText={(text) => setFilters({ ...filters, minCalories: text })}
                  placeholder="Min"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.maxCalories}
                  onChangeText={(text) => setFilters({ ...filters, maxCalories: text })}
                  placeholder="Max"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Protein (g per serving)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.minProtein}
                  onChangeText={(text) => setFilters({ ...filters, minProtein: text })}
                  placeholder="Min"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.maxProtein}
                  onChangeText={(text) => setFilters({ ...filters, maxProtein: text })}
                  placeholder="Max"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Carbs (g per serving)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.minCarbs}
                  onChangeText={(text) => setFilters({ ...filters, minCarbs: text })}
                  placeholder="Min"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.maxCarbs}
                  onChangeText={(text) => setFilters({ ...filters, maxCarbs: text })}
                  placeholder="Max"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Fats (g per serving)</Text>
              <View style={styles.filterRow}>
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.minFats}
                  onChangeText={(text) => setFilters({ ...filters, minFats: text })}
                  placeholder="Min"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
                <TextInput
                  style={[styles.filterInputHalf, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                  value={filters.maxFats}
                  onChangeText={(text) => setFilters({ ...filters, maxFats: text })}
                  placeholder="Max"
                  placeholderTextColor="#999999"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  returnKeyType="next"
                />
              </View>

              <Text style={[styles.filterLabel, { color: '#1A1A1A' }]}>Ingredient</Text>
              <TextInput
                style={[styles.filterInput, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
                value={filters.ingredient}
                onChangeText={(text) => setFilters({ ...filters, ingredient: text })}
                placeholder="Search by ingredient name"
                placeholderTextColor="#999999"
                blurOnSubmit={false}
                returnKeyType="done"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#E0E0E0' }]}
                  onPress={clearFilters}>
                  <Text style={[styles.modalButtonText, { color: '#1A1A1A' }]}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.tint }]}
                  onPress={applyFilters}>
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  list: { padding: 20, paddingBottom: 40 },
  center: { alignItems: 'center', marginTop: 80 },
  bigEmoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  flagEmoji: { fontSize: 24 },
  favoriteButton: { padding: 5 },
  favoriteIcon: { fontSize: 24 },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  ingredientTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  ingredientText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreIngredients: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'center',
    paddingVertical: 6,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  nutritionBox: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionEmoji: { fontSize: 32, marginBottom: 4 },
  nutritionValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  nutritionLabel: { fontSize: 10, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalScroll: { padding: 20 },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  filterInput: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  filterInputHalf: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

