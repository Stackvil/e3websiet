import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { LayoutDashboard, ShoppingCart, Calendar, Package, Power } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

// Helper for API URL (Using 10.0.2.2 for Android Emulator, localhost for others)
// ideally this should be in a constants file
const API_URL = 'http://10.0.2.2:5001';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    router.replace('/login');
                    return;
                }

                // In a real scenario, use headers
                // const headers = { 'x-auth-token': token };

                // MOCKING DATA for Mobile Demo 
                // (Since we might not have the full backend endpoints ready/reachable)
                setOrders([
                    { id: 'ORD001', user: 'Sharmila', status: 'preparing', total: 450, items: 'Momo x2, Mandi x1' },
                    { id: 'ORD002', user: 'Vikas', status: 'placed', total: 220, items: 'Burger x1' },
                    { id: 'ORD003', user: 'Rahul', status: 'delivered', total: 120, items: 'Coffee x2' },
                ]);

                setBookings([
                    { id: 'BK001', facility: 'Cricket', name: 'Team Alpha', date: 'Today, 4 PM' },
                    { id: 'BK002', facility: 'Bumper Cars', name: 'Birthday Party', date: 'Tomorrow, 6 PM' },
                ]);

            } catch (err) {
                console.error('Fetch error:', err);
                Alert.alert("Error", "Failed to fetch dashboard data");
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/login');
    };

    const tabs = [
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'analytics', label: 'Stats', icon: LayoutDashboard },
    ];

    const renderOrderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="font-bold text-gray-800 text-lg">#{item.id}</Text>
                    <Text className="text-gray-500 text-sm">{item.user}</Text>
                </View>
                <View className={clsx(
                    "px-3 py-1 rounded-full",
                    item.status === 'preparing' ? "bg-yellow-100" :
                        item.status === 'delivered' ? "bg-green-100" : "bg-blue-100"
                )}>
                    <Text className={clsx(
                        "text-xs font-bold uppercase",
                        item.status === 'preparing' ? "text-yellow-700" :
                            item.status === 'delivered' ? "text-green-700" : "text-blue-700"
                    )}>{item.status}</Text>
                </View>
            </View>
            <Text className="text-gray-600 mb-3">{item.items}</Text>
            <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                <Text className="font-bold text-lg text-charcoal-grey">₹{item.total}</Text>
                <TouchableOpacity className="bg-riverside-teal px-4 py-2 rounded-lg">
                    <Text className="text-white font-bold text-xs">Manage</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    const renderBookingItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between items-center mb-2">
                <View className="bg-riverside-teal/10 px-3 py-1 rounded-full">
                    <Text className="text-riverside-teal font-bold text-xs">{item.facility}</Text>
                </View>
                <Text className="text-gray-400 text-xs">#{item.id}</Text>
            </View>
            <Text className="font-bold text-lg text-charcoal-grey mb-1">{item.name}</Text>
            <Text className="text-gray-500 text-sm mb-4">{item.date}</Text>
            <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 bg-riverside-teal py-2 rounded-lg items-center">
                    <Text className="text-white font-bold text-xs">Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 border border-gray-200 py-2 rounded-lg items-center">
                    <Text className="text-gray-500 font-bold text-xs">Cancel</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <View>
                    <Text className="text-2xl font-bold text-charcoal-grey">Admin Panel</Text>
                    <Text className="text-gray-500 text-xs">Overview</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} className="bg-red-50 p-2 rounded-full">
                    <Power size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-100 px-2 py-2">
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 items-center py-2 rounded-lg gap-1",
                            activeTab === tab.id ? "bg-riverside-teal/10" : "bg-transparent"
                        )}
                    >
                        <tab.icon size={20} color={activeTab === tab.id ? "#008080" : "#9CA3AF"} />
                        <Text className={clsx(
                            "text-[10px] font-bold uppercase",
                            activeTab === tab.id ? "text-riverside-teal" : "text-gray-400"
                        )}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <View className="flex-1 px-4 py-4">
                {activeTab === 'orders' && (
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No active orders</Text>}
                    />
                )}

                {activeTab === 'bookings' && (
                    <FlatList
                        data={bookings}
                        renderItem={renderBookingItem}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}

                {(activeTab === 'inventory' || activeTab === 'analytics') && (
                    <View className="items-center justify-center mt-20">
                        <Package size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold mt-4">Module Coming Soon</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default AdminDashboard;
