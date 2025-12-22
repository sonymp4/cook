import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      // Success - token and user are saved, navigate to explore
      router.replace('/(tabs)/explore');
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert(
        'Error', 
        error.message || 'Authentication failed. Make sure:\n• Backend server is running\n• Your IP address is correct\n• You are on the same Wi-Fi network'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🍳</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {isLogin
              ? 'Login to explore amazing recipes'
              : 'Join us to save your favorite recipes'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={[styles.input, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
              placeholder="Name"
              placeholderTextColor="#999999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={[styles.input, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
            placeholder="Email"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#1A1A1A' }]}
            placeholder="Password"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switch}
            onPress={() => setIsLogin(!isLogin)}>
            <Text style={[styles.switchText, { color: colors.textMuted }]}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <Text style={[styles.switchTextBold, { color: colors.tint }]}>
              {isLogin ? 'Sign Up' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cards}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
            onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.cardEmoji}>🥄</Text>
            <Text style={[styles.cardText, { color: colors.text }]}>Explore Recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
            onPress={() => router.push('/(tabs)/saved')}>
            <Text style={styles.cardEmoji}>📖</Text>
            <Text style={[styles.cardText, { color: colors.text }]}>Saved Recipes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switch: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
  },
  switchTextBold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cards: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
