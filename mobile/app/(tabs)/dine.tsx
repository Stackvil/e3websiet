import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Search, Filter, Plus, ShoppingBag, Star, Clock } from 'lucide-react-native';
import useStore from '../../store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { Stack } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const STALLS = [
    { id: 1, name: 'Royal Mandi', cuisine: 'Arabian', rating: 4.8, time: '20-30 min' },
    { id: 2, name: 'Beijing Bites', cuisine: 'Chinese', rating: 4.5, time: '15-25 min' },
    { id: 3, name: 'Punjab Grill', cuisine: 'North Indian', rating: 4.7, time: '25-40 min' },
    { id: 4, name: 'Dosa Plaza', cuisine: 'South Indian', rating: 4.6, time: '10-20 min' },
    { id: 5, name: 'Polar Bear', cuisine: 'Desserts', rating: 4.9, time: '5-10 min' },
    { id: 6, name: 'Fish & Chips', cuisine: 'Continental', rating: 4.4, time: '20-30 min' }
];

const MENU_DATA = [
    { id: 101, name: 'Darbar Mandi', price: 450, category: 'Arabian', stall: 'Royal Mandi', image: require('../../assets/images/dine-mandi.jpg'), open: true, rating: 4.8, time: '25 min' },
    { id: 102, name: 'Wow! Momo', price: 190, category: 'Chinese', stall: 'Beijing Bites', image: require('../../assets/images/dine-momo.jpg'), open: true, rating: 4.5, time: '15 min' },
    { id: 103, name: 'Butter Chicken', price: 320, category: 'North Indian', stall: 'Punjab Grill', image: require('../../assets/images/dine-butter-chicken.png'), open: true, rating: 4.9, time: '30 min' },
    { id: 104, name: 'Guntur Dosa', price: 110, category: 'South Indian', stall: 'Dosa Plaza', image: require('../../assets/images/dine-dosa.jpg'), open: true, rating: 4.6, time: '10 min' },
    { id: 105, name: 'Malai Kulfi', price: 150, category: 'Desserts', stall: 'Polar Bear', image: require('../../assets/images/dine-kulfi.jpg'), open: true, rating: 4.7, time: '5 min' },
    { id: 106, name: 'Apollo Fish', price: 340, category: 'Continental', stall: "Fish & Chips", image: require('../../assets/images/dine-fish.jpg'), open: false, rating: 4.4, time: 'Closed' },
];

const Dine = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { addToCart, cart, toggleCart } = useStore();

    const filteredItems = MENU_DATA.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.stall.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const cartCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);

    return (
        <View className="flex-1 bg-surface-app">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pt-4 pb-2 bg-surface-app z-10">
                    <Text className="text-slate-900 text-3xl font-bold tracking-tight mb-4">Culinary</Text>

                    {/* Search Bar */}
                    <View className="flex-row items-center gap-3 mb-6">
                        <View className="flex-1 relative">
                            <View className="absolute left-3 top-3 z-10">
                                <Search size={18} color="#94A3B8" />
                            </View>
                            <TextInput
                                placeholder="Search menu..."
                                placeholderTextColor="#94A3B8"
                                className="bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 text-base"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <TouchableOpacity className="bg-white p-3 rounded-lg border border-slate-200">
                            <Filter size={18} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Filter Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2" contentContainerStyle={{ paddingRight: 24, gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => setActiveCategory('all')}
                            className={clsx(
                                "px-4 py-2 rounded-full border",
                                activeCategory === 'all' ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
                            )}
                        >
                            <Text className={clsx("font-semibold text-sm", activeCategory === 'all' ? "text-white" : "text-slate-600")}>All</Text>
                        </TouchableOpacity>
                        {STALLS.map((stall) => (
                            <TouchableOpacity
                                key={stall.id}
                                onPress={() => setActiveCategory(stall.cuisine)}
                                className={clsx(
                                    "px-4 py-2 rounded-full border",
                                    activeCategory === stall.cuisine ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
                                )}
                            >
                                <Text className={clsx("font-semibold text-sm", activeCategory === stall.cuisine ? "text-white" : "text-slate-600")}>
                                    {stall.cuisine}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
                    {filteredItems.map((item, index) => (
                        <Animated.View
                            entering={FadeInUp.delay(index * 50).springify()}
                            key={item.id}
                            className="bg-white rounded-xl mb-6 shadow-sm border border-slate-100 overflow-hidden"
                        >
                            <View className="h-48 w-full relative">
                                <Image source={item.image} className="w-full h-full" resizeMode="cover" />
                                {!item.open && (
                                    <View className="absolute inset-0 bg-white/50 items-center justify-center backdrop-blur-sm">
                                        <View className="bg-slate-900 px-3 py-1 rounded-full">
                                            <Text className="text-white text-xs font-bold uppercase tracking-widest">Closed</Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <View className="p-4">
                                <View className="flex-row justify-between items-start mb-1">
                                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">{item.stall}</Text>
                                    <View className="flex-row items-center gap-1">
                                        <Star size={12} fill="#F59E0B" color="#F59E0B" />
                                        <Text className="text-slate-700 text-xs font-bold">{item.rating}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-xl font-bold text-slate-900">{item.name}</Text>
                                    <Text className="text-lg font-semibold text-indigo-600">₹{item.price}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => addToCart(item)}
                                    disabled={!item.open}
                                    className={clsx(
                                        "w-full py-3 rounded-lg flex-row items-center justify-center gap-2",
                                        item.open ? "bg-slate-900 active:opacity-90" : "bg-slate-100"
                                    )}
                                >
                                    <Plus size={16} color={item.open ? "white" : "#94A3B8"} />
                                    <Text className={clsx("font-bold text-sm", item.open ? "text-white" : "text-slate-400")}>
                                        Add to Cart
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </ScrollView>
            </SafeAreaView>

            {/* Floating Cart Button - Refined */}
            {cartCount > 0 && (
                <Animated.View entering={FadeInUp.springify()} className="absolute bottom-6 right-6 z-50">
                    <TouchableOpacity
                        onPress={toggleCart}
                        className="bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-indigo-200"
                    >
                        <ShoppingBag size={24} color="white" />
                        <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white font-bold text-[10px]">{cartCount}</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

export default Dine;
