import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, Mail, Instagram, Facebook, Globe, Clock, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Contact = () => {
    const handleOpenMap = () => {
        Linking.openURL('https://maps.google.com/?q=Vijayawada');
    };

    return (
        <View className="flex-1 bg-surface-app">
            <Stack.Screen options={{ headerShown: false }} />

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-6 pt-4 pb-2 bg-surface-app z-10">
                    <Text className="text-slate-900 text-3xl font-bold tracking-tight mb-2">Visit Us</Text>
                    <Text className="text-slate-500 text-base mb-6">Riverfront, Vijayawada</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {/* Map Section */}
                    <TouchableOpacity activeOpacity={0.9} onPress={handleOpenMap} className="mx-6 h-56 bg-slate-200 rounded-2xl overflow-hidden mb-8 relative shadow-sm border border-slate-200">
                        <Image
                            source={require('../../assets/images/contact-header.jpg')}
                            className="w-full h-full opacity-80"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-slate-900/30 items-center justify-center">
                            <View className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex-row items-center gap-2">
                                <MapPin size={16} color="#4F46E5" />
                                <Text className="text-slate-900 font-bold text-sm">Get Directions</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Info Cards */}
                    <View className="px-6 gap-4">
                        <Animated.View entering={FadeInUp.delay(100).springify()} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex-row items-start gap-4">
                            <View className="bg-indigo-50 p-3 rounded-full">
                                <Clock size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base mb-1">Opening Hours</Text>
                                <Text className="text-slate-500 text-sm">Daily: 10:00 AM - 11:00 PM</Text>
                                <Text className="text-slate-500 text-sm">Weekends: Until 12:00 AM</Text>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(200).springify()} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex-row items-start gap-4">
                            <View className="bg-indigo-50 p-3 rounded-full">
                                <Phone size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base mb-1">Contact</Text>
                                <Text className="text-slate-500 text-sm mb-2">+91 98765 43210</Text>
                                <TouchableOpacity className="flex-row items-center gap-1">
                                    <Text className="text-indigo-600 font-semibold text-sm">Call Now</Text>
                                    <ArrowRight size={14} color="#4F46E5" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(300).springify()} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex-row items-start gap-4">
                            <View className="bg-indigo-50 p-3 rounded-full">
                                <Mail size={20} color="#4F46E5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base mb-1">Email</Text>
                                <Text className="text-slate-500 text-sm">hello@ethree-vijayawada.com</Text>
                            </View>
                        </Animated.View>
                    </View>

                    {/* Socials */}
                    <View className="mt-10 px-6">
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 text-center">Follow Us</Text>
                        <View className="flex-row justify-center gap-6">
                            <TouchableOpacity className="p-3 bg-white rounded-full border border-slate-200">
                                <Instagram size={24} color="#E1306C" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-3 bg-white rounded-full border border-slate-200">
                                <Facebook size={24} color="#1877F2" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-3 bg-white rounded-full border border-slate-200">
                                <Globe size={24} color="#4F46E5" />
                            </TouchableOpacity>
                        </View>
                        <View className="mt-8 mb-4 items-center">
                            <Text className="text-slate-300 text-xs">© 2024 Ethree Vijayawada. All rights reserved.</Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default Contact;
