import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
// import { Link, useRouter } from 'expo-router'; // Kept if needed later, otherwise unused now
import useStore from '../../store/useStore';
import { ACTIVITIES } from './play';
import RideCard from '../../components/RideCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Home = () => {
    return (
        <View className="flex-1 bg-[#f4f6fb]">
            <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
                {/* Header / Search */}
                <View className="bg-white px-4 pt-12 pb-4 shadow-sm border-b border-slate-100 mb-2">
                    <Text className="text-2xl font-bold text-slate-800 mb-4">Bumping Cars & More</Text>

                    {/* Search Bar Placeholder */}
                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 gap-3">
                        <Text className="text-slate-400">🔍</Text>
                        <Text className="text-slate-400 font-medium">Search "bowling"</Text>
                    </View>
                </View>

                {/* Content Body */}
                <View className="bg-[#f4f6fb] min-h-screen px-4 pt-4 pb-32">
                    {/* Section Title */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-slate-800">All Rides</Text>
                        <Text className="text-[#27a844] font-bold text-xs">See all</Text>
                    </View>

                    <View className="flex-row flex-wrap justify-between">
                        {ACTIVITIES.map((ride, index) => (
                            <RideCard key={ride.id} ride={ride} />
                        ))}
                    </View>

                    {/* Footer Note */}
                    <View className="mt-12 items-center">
                        <Text className="text-slate-400 text-xs uppercase tracking-widest">Ethree Vijayawada • Est 2024</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default Home;
