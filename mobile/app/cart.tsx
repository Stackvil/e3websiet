import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react-native';
import useStore from '../store/useStore';

const Cart = () => {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, clearCart } = useStore();

    const total = cart.reduce((sum: number, item: any) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <View className="flex-1 bg-surface-app">
            <Stack.Screen options={{
                headerShown: true,
                title: 'My Cart',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                ),
            }} />

            <SafeAreaView className="flex-1" edges={['bottom']}>
                {cart.length === 0 ? (
                    <View className="flex-1 items-center justify-center p-6 bg-slate-50/50">
                        <View className="bg-white p-6 rounded-full shadow-sm mb-6 border border-slate-100">
                            <ShoppingBag size={48} color="#94A3B8" />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</Text>
                        <Text className="text-slate-500 text-center mb-8 px-8 leading-relaxed">
                            Looks like you haven't added any rides or activities yet.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className="bg-indigo-600 px-8 py-3 rounded-full shadow-md shadow-indigo-200 active:opacity-90"
                        >
                            <Text className="text-white font-semibold">Start Booking</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                            {cart.map((item: any) => (
                                <View key={item.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-slate-100 flex-row gap-4">
                                    <View className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 relative">
                                        <Image source={item.image} className="w-full h-full" resizeMode="cover" />
                                        <View className="absolute inset-0 bg-black/5" />
                                    </View>

                                    <View className="flex-1 justify-between py-1">
                                        <View>
                                            <View className="flex-row justify-between items-start">
                                                <Text className="text-base font-bold text-slate-900 flex-1 mr-2" numberOfLines={1}>{item.title}</Text>
                                                <TouchableOpacity onPress={() => removeFromCart(item.id)} hitSlop={10}>
                                                    <Trash2 size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                            <Text className="text-slate-500 text-xs mt-0.5">{item.category}</Text>
                                        </View>

                                        <View className="flex-row items-center justify-between mt-2">
                                            <View className="flex-row items-center bg-slate-50 rounded-lg border border-slate-200">
                                                <TouchableOpacity
                                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 items-center justify-center active:bg-slate-200 rounded-l-lg"
                                                >
                                                    <Text className="text-slate-600 font-bold">-</Text>
                                                </TouchableOpacity>
                                                <View className="w-8 items-center justify-center border-x border-slate-200 bg-white h-8">
                                                    <Text className="text-slate-900 font-semibold">{item.quantity}</Text>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 items-center justify-center active:bg-slate-200 rounded-r-lg"
                                                >
                                                    <Text className="text-slate-600 font-bold">+</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <Text className="text-indigo-600 font-bold text-base">
                                                ₹{(typeof item.price === 'number' ? item.price : 0) * item.quantity}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <View className="bg-white p-6 pb-8 border-t border-slate-100 shadow-[0_-4px_30px_rgba(0,0,0,0.03)] rounded-t-3xl">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-slate-500 font-medium">Total Amount</Text>
                                <Text className="text-2xl font-bold text-slate-900">₹{total}</Text>
                            </View>

                            <TouchableOpacity
                                className="bg-slate-900 py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-slate-200 active:scale-[0.99] transition-transform"
                                onPress={() => {
                                    // Placeholder checkout
                                    alert('Proceeding to checkout...');
                                }}
                            >
                                <Text className="text-white font-bold text-lg mr-2">Proceed to Pay</Text>
                                <ArrowRight size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </SafeAreaView>
        </View>
    );
};

export default Cart;
