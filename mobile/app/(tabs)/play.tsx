import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Play as PlayIcon, Info } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import clsx from 'clsx';
import useStore from '../../store/useStore';

export const ACTIVITIES = [
    {
        id: 1,
        title: 'Bumping Cars',
        price: 150,
        ageGroup: '7+ years',
        category: 'Action',
        image: require('../../assets/images/play-bumper.jpg'),
        desc: 'High-octane fun for kids and adults alike.'
    },
    {
        id: 2,
        title: 'Indoor Cricket',
        price: 500,
        ageGroup: 'Youth',
        category: 'Sports',
        image: require('../../assets/images/play-cricket.jpg'),
        desc: 'Professional-grade indoor cricket pitches.'
    },
    {
        id: 3,
        title: 'Trampoline Zone',
        price: 200,
        ageGroup: 'Kids',
        category: 'Action',
        image: require('../../assets/images/play-trampoline.jpg'),
        desc: 'Anti-gravity world with giant trampolines.'
    },
    {
        id: 4,
        title: 'Circling Tower',
        price: 120,
        ageGroup: 'Kids',
        category: 'Rides',
        image: require('../../assets/images/play-tower.jpg'),
        desc: 'Panoramic views of the Krishna river.'
    },
    {
        id: 5,
        title: 'Arcade Arena',
        price: 'Coin',
        ageGroup: 'All Ages',
        category: 'Gaming',
        image: require('../../assets/images/play-arcade.jpg'),
        desc: 'Modern VR games and classic arcades.'
    },
    // Replicating items (using URIs for new ones to match website data style where local assets missing)
    { id: 6, title: 'VR Experience', price: 300, ageGroup: '10+', category: 'Gaming', image: { uri: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&w=600&q=80' }, desc: 'Immersive Virtual Reality adventures.' },
    { id: 7, title: 'Bowling Alley', price: 400, ageGroup: 'All Ages', category: 'Sports', image: { uri: 'https://images.unsplash.com/photo-1538566914565-d4c382103348?auto=format&fit=crop&w=600&q=80' }, desc: 'Classic ten-pin bowling fun.' },
    { id: 8, title: 'Laser Tag', price: 350, ageGroup: '8+', category: 'Action', image: { uri: 'https://images.unsplash.com/photo-1555567540-c3d32847c20f?auto=format&fit=crop&w=600&q=80' }, desc: 'Tactical laser combat arena.' },
    { id: 9, title: 'Kids Soft Play', price: 250, ageGroup: 'Toddlers', category: 'Kids', image: { uri: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80' }, desc: 'Safe and soft play area for little ones.' },
    { id: 10, title: 'Go Karting', price: 600, ageGroup: '12+', category: 'Action', image: { uri: 'https://images.unsplash.com/photo-1505521377774-103a8cc2f735?auto=format&fit=crop&w=600&q=80' }, desc: 'Speed and thrills on the track.' },
    { id: 11, title: 'Archery', price: 150, ageGroup: '10+', category: 'Sports', image: { uri: 'https://images.unsplash.com/photo-1511066922412-1d54cb6c5073?auto=format&fit=crop&w=600&q=80' }, desc: 'Test your aim and precision.' },
    { id: 12, title: 'Rope Course', price: 200, ageGroup: '8+', category: 'Adventure', image: { uri: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=600&q=80' }, desc: 'Challenging obstacles high above.' },
    { id: 13, title: 'Bull Ride', price: 100, ageGroup: '10+', category: 'Rides', image: { uri: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80' }, desc: 'Can you stay on the mechanical bull?' },
    { id: 14, title: 'Mini Golf', price: 180, ageGroup: 'All Ages', category: 'Sports', image: { uri: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=600&q=80' }, desc: 'Fun putting challenges.' },
    { id: 15, title: 'Mirror Maze', price: 120, ageGroup: 'All Ages', category: 'Adventure', image: { uri: 'https://images.unsplash.com/photo-1505322965620-332e92c30084?auto=format&fit=crop&w=600&q=80' }, desc: 'Find your way through the reflections.' },
    { id: 16, title: 'Horror House', price: 200, ageGroup: '12+', category: 'Adventure', image: { uri: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80' }, desc: 'Spooky thrills and scares.' },
    { id: 17, title: 'Escape Room', price: 800, ageGroup: 'Group', category: 'Puzzle', image: { uri: 'https://images.unsplash.com/photo-1517260739337-6799d239ce83?auto=format&fit=crop&w=600&q=80' }, desc: 'Solve puzzles to escape in time.' },
    { id: 18, title: 'Paintball', price: 450, ageGroup: '14+', category: 'Action', image: { uri: 'https://images.unsplash.com/photo-1555567959-199c9684c30c?auto=format&fit=crop&w=600&q=80' }, desc: 'Color combat with friends.' },
    { id: 19, title: 'Water Boat', price: 150, ageGroup: 'Kids', category: 'Rides', image: { uri: 'https://images.unsplash.com/photo-1563299796-b729d0af54a5?auto=format&fit=crop&w=600&q=80' }, desc: 'Gentle boating fun for kids.' },
    { id: 20, title: 'Ferris Wheel', price: 250, ageGroup: 'All Ages', category: 'Rides', image: { uri: 'https://images.unsplash.com/photo-1528659567210-985ea83c9284?auto=format&fit=crop&w=600&q=80' }, desc: 'Classic views from the top.' }
];

const Play = () => {
    const { addToCart } = useStore();
    const [filter, setFilter] = useState('All');

    const filteredActivities = filter === 'All'
        ? ACTIVITIES
        : ACTIVITIES.filter(a => a.ageGroup.includes(filter) || a.category === filter);

    return (
        <View className="flex-1 bg-surface-app">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pt-4 pb-2 bg-surface-app z-10">
                    <Text className="text-slate-900 text-3xl font-bold tracking-tight mb-4">Activities</Text>

                    {/* Filters */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerStyle={{ gap: 10 }}>
                        {['All', 'Sports', 'Action', 'Gaming', 'Rides'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setFilter(cat)}
                                className={clsx(
                                    "px-4 py-2 rounded-full border",
                                    filter === cat ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
                                )}
                            >
                                <Text className={clsx("font-semibold text-sm", filter === cat ? "text-white" : "text-slate-600")}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {filteredActivities.map((activity, index) => (
                        <Animated.View
                            entering={FadeInUp.delay(index * 100).springify()}
                            key={activity.id}
                            className="bg-white rounded-xl mb-6 shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <View className="h-48 w-full relative">
                                <Image source={activity.image} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <Text className="text-xs font-bold text-slate-800 uppercase tracking-widest">{activity.category}</Text>
                                </View>
                            </View>

                            <View className="p-5">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-xl font-bold text-slate-900 flex-1 mr-2">{activity.title}</Text>
                                    <Text className="text-lg font-semibold text-indigo-600">
                                        {typeof activity.price === 'number' ? `₹${activity.price}` : activity.price}
                                    </Text>
                                </View>

                                <Text className="text-slate-500 text-sm leading-relaxed mb-4">{activity.desc}</Text>

                                <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
                                    <View className="flex-row items-center gap-2">
                                        <Info size={14} color="#64748B" />
                                        <Text className="text-slate-500 text-xs font-medium">{activity.ageGroup}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => addToCart({ ...activity, name: activity.title, stall: 'Gaming', price: typeof activity.price === 'number' ? activity.price : 0 })}
                                        className="bg-slate-900 px-5 py-2 rounded-lg active:opacity-90"
                                    >
                                        <Text className="text-white font-bold text-sm">Book</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default Play;
