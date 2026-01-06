import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AdminLayout() {
    const { user, loading } = useAuth();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    if (!user || user.role !== 'admin') {
        return <Redirect href="/" />;
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen name="dashboard" options={{ title: 'Admin Dashboard', headerLeft: () => null }} />
            <Stack.Screen name="recipes/index" options={{ title: 'Manage Recipes' }} />
            <Stack.Screen name="workouts/index" options={{ title: 'Manage Workouts' }} />
        </Stack>
    );
}
