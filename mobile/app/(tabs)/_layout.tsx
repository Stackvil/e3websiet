import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Utensils, Play, Phone } from 'lucide-react-native';
import { View, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0', // slate-200
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#4F46E5', // indigo-600
        tabBarInactiveTintColor: '#94A3B8', // slate-400
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="dine"
        options={{
          title: 'Dining',
          tabBarIcon: ({ color, focused }) => (
            <Utensils size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, focused }) => (
            <Play size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Visit',
          tabBarIcon: ({ color, focused }) => (
            <Phone size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

