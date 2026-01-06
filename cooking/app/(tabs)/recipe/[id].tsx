import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { api } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';

interface Recipe {
  _id: string;
  name: string;
  description?: string;
  instructions: string[];
  ingredients: Array<{
    ingredient: {
      _id: string;
      name: string;
      category?: string;
    };
    quantity: number;
    unit: string;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  perServing: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  servings: number;
  difficulty: string;
  category: string;
  prepTime?: number;
  cookTime?: number;
  country?: string;
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const response = await api.get<Recipe>(`/recipes/${id}`);
      if (response.success && response.data) {
        setRecipe(response.data);
      } else {
        Alert.alert('Error', 'Recipe not found');
        router.back();
      }
    } catch (error: any) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Could not load recipe');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save recipes');
      return;
    }

    try {
      await api.post(`/users/favorites/${id}`, {});
      Alert.alert('Success', 'Recipe added to favorites! ❤️');
    } catch (error: any) {
      if (error.message?.includes('already')) {
        Alert.alert('Already Saved', 'This recipe is already in your favorites');
      } else {
        Alert.alert('Error', error.message || 'Failed to save recipe');
      }
    }
  };

  const getCountryFlag = (country?: string) => {
    if (!country) return '🌍';
    const countryLower = country.toLowerCase();
    const flagMap: { [key: string]: string } = {
      'italy': '🇮🇹',
      'japan': '🇯🇵',
      'mexico': '🇲🇽',
      'india': '🇮🇳',
      'thailand': '🇹🇭',
      'south korea': '🇰🇷',
      'korea': '🇰🇷',
      'spain': '🇪🇸',
      'united states': '🇺🇸',
      'usa': '🇺🇸',
      'france': '🇫🇷',
      'china': '🇨🇳',
      'brazil': '🇧🇷',
      'greece': '🇬🇷',
      'vietnam': '🇻🇳',
      'indonesia': '🇮🇩',
      'united kingdom': '🇬🇧',
      'uk': '🇬🇧',
      'britain': '🇬🇧',
      'morocco': '🇲🇦',
      'turkey': '🇹🇷',
      'germany': '🇩🇪',
      'portugal': '🇵🇹',
      'russia': '🇷🇺',
      'egypt': '🇪🇬',
      'lebanon': '🇱🇧',
      'israel': '🇮🇱',
      'international': '🌍',
    };
    return flagMap[countryLower] || '🌍';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4ECDC4';
      case 'medium':
        return '#FFD93D';
      case 'hard':
        return '#FF6B6B';
      default:
        return '#FF6B6B';
    }
  };

  const isSpiceOrSeasoning = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    return (
      name.includes('spice') ||
      name.includes('pepper') ||
      name.includes('cumin') ||
      name.includes('turmeric') ||
      name.includes('paprika') ||
      name.includes('ginger') ||
      name.includes('garlic') ||
      name.includes('chili') ||
      name.includes('curry') ||
      name.includes('herb') ||
      name.includes('salt') ||
      name.includes('oregano') ||
      name.includes('basil') ||
      name.includes('thyme') ||
      name.includes('rosemary') ||
      name.includes('cinnamon') ||
      name.includes('nutmeg') ||
      name.includes('cardamom') ||
      name.includes('coriander') ||
      name.includes('parsley') ||
      name.includes('cilantro') ||
      name.includes('bay leaf') ||
      name.includes('clove') ||
      name.includes('vanilla') ||
      name.includes('saffron')
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={styles.loadingEmoji}>🍳</Text>
        <Text style={[styles.loadingText, { color: '#1A1A1A' }]}>Loading recipe... 🍳</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#1A1A1A' }]}>Recipe not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Separate spices from main ingredients
  const spices = recipe.ingredients.filter((item) =>
    isSpiceOrSeasoning(item.ingredient?.name || '')
  );

  const mainIngredients = recipe.ingredients.filter(
    (item) => !isSpiceOrSeasoning(item.ingredient?.name || '')
  );

  const calories = recipe.perServing?.calories
    ? Math.round(recipe.perServing.calories)
    : recipe.totalCalories && recipe.servings
      ? Math.round(recipe.totalCalories / recipe.servings)
      : Math.round(recipe.totalCalories) || 0;

  const protein = recipe.perServing?.protein
    ? recipe.perServing.protein.toFixed(1)
    : recipe.totalProtein && recipe.servings
      ? (recipe.totalProtein / recipe.servings).toFixed(1)
      : recipe.totalProtein?.toFixed(1) || '0.0';

  const carbs = recipe.perServing?.carbs
    ? recipe.perServing.carbs.toFixed(1)
    : recipe.totalCarbs && recipe.servings
      ? (recipe.totalCarbs / recipe.servings).toFixed(1)
      : recipe.totalCarbs?.toFixed(1) || '0.0';

  const fats = recipe.perServing?.fats
    ? recipe.perServing.fats.toFixed(1)
    : recipe.totalFats && recipe.servings
      ? (recipe.totalFats / recipe.servings).toFixed(1)
      : recipe.totalFats?.toFixed(1) || '0.0';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>📖 Recipe Details</Text>
        </View>
        {user && (
          <TouchableOpacity style={styles.favoriteButton} onPress={handleAddFavorite}>
            <Text style={styles.favoriteIcon}>❤️</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recipe Title Section */}
        <View style={[styles.titleSection, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.recipeName, { color: '#1A1A1A' }]}>{recipe.name}</Text>
            {recipe.country && (
              <Text style={styles.countryFlag}>{getCountryFlag(recipe.country)}</Text>
            )}
          </View>
          {recipe.description && (
            <Text style={[styles.description, { color: '#555555' }]}>
              {recipe.description}
            </Text>
          )}

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(recipe.difficulty) },
              ]}>
              <Text style={styles.badgeText}>
                {recipe.difficulty?.charAt(0).toUpperCase() + recipe.difficulty?.slice(1) || 'Medium'}
              </Text>
            </View>
            {recipe.prepTime && (
              <View style={styles.metaItem}>
                <Text style={styles.metaEmoji}>⏱️</Text>
                <Text style={[styles.metaText, { color: '#555555' }]}>
                  {recipe.prepTime} min prep
                </Text>
              </View>
            )}
            {recipe.cookTime && (
              <View style={styles.metaItem}>
                <Text style={styles.metaEmoji}>🔥</Text>
                <Text style={[styles.metaText, { color: '#555555' }]}>
                  {recipe.cookTime} min cook
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Text style={styles.metaEmoji}>🍽️</Text>
              <Text style={[styles.metaText, { color: '#555555' }]}>
                {recipe.servings} servings
              </Text>
            </View>
          </View>
        </View>

        {/* Nutrition Info */}
        <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: '#1A1A1A' }]}>
            📊 Nutrition (per serving)
          </Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionEmoji}>🔥</Text>
              <Text style={[styles.nutritionValue, { color: '#1A1A1A' }]}>{calories}</Text>
              <Text style={[styles.nutritionLabel, { color: '#666666' }]}>Calories</Text>
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
        </View>

        {/* Main Ingredients */}
        {mainIngredients.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: '#1A1A1A' }]}>🥘 Main Ingredients</Text>
            <View style={styles.ingredientsList}>
              {mainIngredients.map((item, index) => (
                <View key={index} style={[styles.ingredientItem, { backgroundColor: '#FFF9F5' }]}>
                  <View style={styles.ingredientLeft}>
                    <Text style={styles.ingredientBullet}>•</Text>
                    <Text style={[styles.ingredientName, { color: '#1A1A1A' }]}>
                      {item.ingredient?.name || 'Unknown'}
                    </Text>
                  </View>
                  <Text style={[styles.ingredientAmount, { color: '#555555' }]}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Spices & Seasonings */}
        {spices.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: '#1A1A1A' }]}>
              🌶️ Spices & Seasonings
            </Text>
            <View style={styles.ingredientsList}>
              {spices.map((item, index) => (
                <View key={index} style={[styles.ingredientItem, { backgroundColor: '#FFF9F5' }]}>
                  <View style={styles.ingredientLeft}>
                    <Text style={styles.ingredientBullet}>•</Text>
                    <Text style={[styles.ingredientName, { color: '#1A1A1A' }]}>
                      {item.ingredient?.name || 'Unknown'}
                    </Text>
                  </View>
                  <Text style={[styles.ingredientAmount, { color: '#555555' }]}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Cooking Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <View style={[styles.section, { backgroundColor: '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: '#1A1A1A' }]}>
              👨‍🍳 How to Cook & Prepare
            </Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.tint }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.instructionContent}>
                    <Text style={[styles.instructionText, { color: '#1A1A1A' }]}>
                      {instruction}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 26,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  countryFlag: {
    fontSize: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaEmoji: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    marginBottom: 10,
    marginHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'space-between',
  },
  nutritionBox: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  nutritionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  nutritionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  ingredientsList: {
    gap: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  ingredientBullet: {
    fontSize: 20,
    color: '#FF8A65',
    fontWeight: 'bold',
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  instructionsList: {
    gap: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '500',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
});


