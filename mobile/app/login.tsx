import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import clsx from 'clsx';
import { Stack } from 'expo-router';
import { ArrowLeft, Mail, Lock, Key } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

// For Android Emulator use 'http://10.0.2.2:5001'
// For Physical Device use your machine's IP e.g. 'http://192.168.1.X:5001'
const API_URL = 'http://10.0.2.2:5001';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email/Pass selection, 2: OTP Entry
    const [isOtpLogin, setIsOtpLogin] = useState(false);
    const router = useRouter();

    const handleSendOtp = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setStep(2);
                setIsOtpLogin(true);
            } else {
                Alert.alert('Error', 'Failed to send OTP');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to connect to server');
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();
            if (data.token) {
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                router.replace('/');
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP');
            }
        } catch (err) {
            Alert.alert('Error', 'OTP verification error');
        }
    };

    const handleSubmit = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.token) {
                await AsyncStorage.setItem('token', data.token);
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                if (data.user.role === 'admin') {
                    router.replace('/admin/dashboard');
                }
                else router.replace('/');
            } else {
                Alert.alert('Error', data.message || 'Login failed');
            }
        } catch (err) {
            Alert.alert('Error', 'Login error');
            console.error(err);
        }
    };

    return (
        <View className="flex-1 bg-surface-app">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header / Back */}
            <SafeAreaView edges={['top']} className="absolute z-50 w-full px-6 top-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200"
                >
                    <ArrowLeft size={20} color="#334155" />
                </TouchableOpacity>
            </SafeAreaView>

            <View className="flex-1 justify-center px-6">
                <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-12">
                    <View className="bg-indigo-50 p-4 rounded-3xl mb-6 shadow-sm">
                        <Key size={32} color="#4F46E5" />
                    </View>
                    <Text className="text-3xl font-bold text-slate-900 text-center mb-2 tracking-tight">Welcome Back</Text>
                    <Text className="text-slate-500 text-center text-base">Sign in to your account.</Text>
                </Animated.View>

                {step === 1 ? (
                    <Animated.View entering={FadeInUp.delay(200).springify()} className="space-y-6">
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <Mail size={18} color="#94A3B8" />
                                </View>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base focus:border-indigo-500 focus:bg-white"
                                    placeholder="user@example.com"
                                    placeholderTextColor="#94A3B8"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">Password</Text>
                            <View className="relative">
                                <View className="absolute left-4 top-4 z-10">
                                    <Lock size={18} color="#94A3B8" />
                                </View>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base focus:border-indigo-500 focus:bg-white"
                                    placeholder="••••••••"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="w-full bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-200 mt-4 active:scale-[0.98]"
                        >
                            <Text className="text-white font-bold text-lg">Sign In</Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-4 my-4">
                            <View className="h-[1px] bg-slate-200 flex-1"></View>
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">OR</Text>
                            <View className="h-[1px] bg-slate-200 flex-1"></View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSendOtp}
                            className="w-full border border-slate-200 bg-white py-4 rounded-xl items-center flex-row justify-center gap-2 active:bg-slate-50"
                        >
                            <Text className="text-slate-700 font-semibold">Login with OTP</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInUp.springify()} className="space-y-6">
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">Enter OTP</Text>
                            <Text className="text-xs text-slate-400 mb-4 ml-1">We've sent a 6-digit code to {email}</Text>
                            <TextInput
                                value={otp}
                                onChangeText={setOtp}
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-2xl font-bold tracking-widest text-slate-900 focus:border-indigo-500 focus:bg-white"
                                placeholder="• • • • • •"
                                placeholderTextColor="#94A3B8"
                                maxLength={6}
                                keyboardType="number-pad"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleVerifyOtp}
                            className="w-full bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-200"
                        >
                            <Text className="text-white font-bold text-lg">Verify & Proceed</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setStep(1)}
                            className="items-center py-2"
                        >
                            <Text className="text-slate-400 text-sm font-semibold">Back to Password</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <View className="mt-auto pt-8 items-center">
                    <Text className="text-slate-400 text-sm">
                        Don't have an account? <Text className="text-indigo-600 font-bold">Register Now</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default Login;
