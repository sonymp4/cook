import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <Text style={styles.headerTitle}>🍳 Cooking App</Text>
        {user && <Text style={styles.headerSubtitle}>Welcome back, {user.name}!</Text>}
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
          onPress={() => router.push('/(tabs)/explore')}>
          <Text style={styles.cardEmoji}>🥄</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Explore Recipes</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            Discover recipes from around the world
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
          onPress={() => router.push('/(tabs)/saved')}>
          <Text style={styles.cardEmoji}>📖</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>My Saved Recipes</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            View your favorite recipes
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  cards: {
    padding: 20,
    gap: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
});

