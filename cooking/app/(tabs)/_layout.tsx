import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* HOME (Cooking App) */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />

      {/* EXPLORE */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🥄</Text>,
        }}
      />

      {/* SAVED */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📖</Text>,
        }}
      />

      {/* FITNESS */}
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💪</Text>,
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="recipe/[id]"
        options={{ href: null }}
      />

    </Tabs>
  );
}
